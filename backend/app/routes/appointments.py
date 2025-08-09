'''from datetime import date, timedelta
from fastapi import (
    APIRouter, status, Body, Query, Path, Depends, HTTPException
)
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.schemas import AppointmentCreate, AppointmentGet
from db.models import Offering, Customer, Appointment
from db.postgresql import get_session
from db.queries import select_one


appointments_router = APIRouter(prefix='/appointments')


@appointments_router.get('/', response_model=list[AppointmentGet])
async def get_appointments(
    session: Annotated[AsyncSession, Depends(get_session)],
    date: Annotated[date | None, Query()] = None,
    confirmed: Annotated[bool | None, Query()] = None
):
    """Получение всех записей"""
    # Делаем JOIN запрос между Appointment и Customer
    query = (
        select(Appointment, Customer)
        .join(Customer, Appointment.customer_id == Customer.id)
        .order_by(Appointment.datetime)
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
    
    result = await session.execute(query)
    appointments_data = result.all()
    
    # Форматируем результат в нужный формат
    formatted_appointments = [
        {
            'id': appointment.id,
            'name': customer.name,
            'phone': customer.phone,
            'service': appointment.service,
            'master': appointment.master,
            'datetime': appointment.datetime.isoformat(),
            'confirmed': appointment.confirmed
        }
        for appointment, customer in appointments_data
    ]
    
    return formatted_appointments


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
    # 1. Поиск пользователя по номеру телефона
    customer = await select_one(session, Customer, {'phone': appointment.phone})
    
    # 2. Обработка пользователя
    if customer is None:
        # Создаем нового пользователя
        customer = Customer(
            phone=appointment.phone,
            name=appointment.name,
            status='active'
        )
        await session.add(customer)
        # Чтобы получить ID нового пользователя
        await session.flush()
    
    # 3. Поиск услуги мастера по id
    offering = await select_one(session, Offering, {'id', appointment.offering_id})
    if offering is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Offering with such id doesn\'t exist'
        )
    
    # 4. Создаём запись о назначении
    new_appointment = Appointment(
        name=appointment.name,
        customer_id=customer.id,
        offering_id=offering.id,
        datetime=appointment.datetime
    )
    await session.add(new_appointment)
    
    # 4. Сохраняем изменения
    await session.commit()
    
    return {'message': 'OK'}'''


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
