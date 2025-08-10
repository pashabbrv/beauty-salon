from datetime import date, timedelta
from fastapi import APIRouter, status, Body, Query, Depends, HTTPException
from sqlalchemy import select, insert
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import AppointmentCreate, AppointmentGet
from db.models import Offering, Customer, Appointment
from db.postgresql import get_session
from db.queries import select_one


appointments_router = APIRouter(prefix='/appointments')


@appointments_router.get('/', response_model=list[AppointmentGet])
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
            joinedload(Appointment.offering).joinedload(Offering.service)
        )
    )
    # Фильтрация по подтверждённости
    if confirmed is not None:
        query = query.where(Appointment.confirmed == confirmed)
    # Фильтрация по дате записи
    if date is not None:
        query = query.where(
            Appointment.datetime >= date,
            Appointment.datetime < date + timedelta(days=1)
        )
    # Получение результата
    result = await session.execute(query)
    return result.scalars().all()


@appointments_router.post(
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
    
    # 2. Поиск услуги мастера по id
    result = await session.execute(
        select(Offering).where(Offering.id == appointment.offering_id)
    )
    offering = result.scalar_one_or_none()
    if offering is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Offering with such id doesn\'t exist'
        )
    
    # 3. Создаём запись о назначении
    result = await session.execute(
        insert(Appointment)
        .values(
            name=appointment.name,
            customer_id=customer.id,
            offering_id=offering.id,
            datetime=appointment.datetime
        ).returning(Appointment)
        .options(
            joinedload(Appointment.customer),
            joinedload(Appointment.offering).joinedload(Offering.master),
            joinedload(Appointment.offering).joinedload(Offering.service)
        )
    )
    new_appointment = result.scalar_one()
    
    # 4. Сохраняем изменения
    await session.commit()
    await session.refresh(new_appointment)
    
    return new_appointment


'''@appointments_router.delete(
    '/{appointment_id}/',
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_appointment(
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment_id: Annotated[int, Path()]
):
    """Удаление записи по её id"""
    query = delete(Appointment).where(Appointment.id == appointment_id)
    result = await session.execute(query)
    # Если записей с таким id не существовало
    if result.rowcount == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Appointment not found'
        )
    await session.commit()
    return None'''
