import secrets
from datetime import date, timedelta
from fastapi import (
    APIRouter, status, Body, Query, Path, Depends, HTTPException
)
from sqlalchemy import select, insert, delete
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import AppointmentCreate, AppointmentGet
from db.models import Offering, Customer, Appointment, Occupation
from db.postgresql import get_session
from db.queries import select_one


basic_router = APIRouter()


@basic_router.get('/', response_model=list[AppointmentGet])
async def get_appointments(
    _: Annotated[None, Depends(verify_token)], # Верификация по токену
    session: Annotated[AsyncSession, Depends(get_session)],
    date: Annotated[date | None, Query()] = None,
    confirmed: Annotated[bool | None, Query()] = None
):
    """Получение всех записей"""
    query = (
        select(Appointment)
        .options(
            joinedload(Appointment.customer),
            joinedload(Appointment.offering).joinedload(Offering.master),
            joinedload(Appointment.offering).joinedload(Offering.service),
            joinedload(Appointment.slot)
        )
    )
    # Фильтрация по подтверждённости
    if confirmed is not None:
        query = query.where(Appointment.confirmed == confirmed)
    # Фильтрация по дате записи
    if date is not None:
        query = query.where(
            Occupation.start >= date,
            Occupation.start < date + timedelta(days=1)
        )
    # Получение результата
    result = await session.execute(query)
    return result.scalars().all()


@basic_router.post(
    '/',
    response_model=AppointmentGet,
    status_code=status.HTTP_201_CREATED
)
async def create_new_appointment(
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment: Annotated[AppointmentCreate, Body()]
):
    """Запись на приём к мастеру"""
    # 1. Поиск пользователя по номеру телефона (с созданием нового по надобности)
    customer = await select_one(session, Customer, {'phone': appointment.phone})
    if customer is None:
        result = await session.execute(
            insert(Customer)
            .values(
                phone=appointment.phone,
                name=appointment.name,
                status='active'
            ).returning(Customer)
        )
        customer = result.scalar_one()
    else:
        # Проверка, что пользователь не заблокирован
        if customer.status == 'blocked':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='User with this phone number has been blocked'
            )
    
    # 2. Поиск услуги мастера по id
    offering = await select_one(session, Offering, {'id': appointment.offering_id})
    if offering is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Offering with such id doesn\'t exist'
        )
    
    # 3. Забиваем временной слот у мастера
    occupation_result = await session.execute(
        insert(Occupation)
        .values(
            master_id=offering.master_id,
            start=appointment.datetime,
            end=appointment.datetime + timedelta(
                hours=offering.duration.hour,
                minutes=offering.duration.minute,
                seconds=offering.duration.second
            )
        ).returning(Occupation.id)
    )

    # 4. Создаём запись в бд
    secret_code = ''.join(str(secrets.randbelow(10)) for _ in range(5))
    result = await session.execute(
        insert(Appointment)
        .values(
            name=appointment.name,
            customer_id=customer.id,
            offering_id=offering.id,
            occupation_id=occupation_result.scalar_one(),
            secret_code=secret_code
        ).returning(Appointment)
        .options(
            joinedload(Appointment.customer),
            joinedload(Appointment.offering).joinedload(Offering.master),
            joinedload(Appointment.offering).joinedload(Offering.service),
            joinedload(Appointment.slot)
        )
    )
    new_appointment = result.scalar_one()
    
    # 5. Сохраняем изменения
    await session.commit()
    await session.refresh(new_appointment)
    
    return new_appointment


@basic_router.delete(
    '/{appointment_id}/',
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_appointment(
    _: Annotated[None, Depends(verify_token)], # Верификация по токену
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment_id: Annotated[int, Path()]
):
    """Удаление записи по её id"""
    result = await session.execute(
        delete(Appointment).where(Appointment.id == appointment_id)
    )
    # Если записей с таким id не существовало
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Appointment with such id doesn\'t exist'
        )
    await session.commit()
    return None
