from datetime import date, timedelta
from fastapi import FastAPI, status, Body, Query, Path, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from .core.schemas import SimpleAppointment, UpdateAppointment
from .core.exceptions import register_exception_handlers
from .db.postgresql import create_tables, get_session
from .db.models import Customer, Appointment


app = FastAPI(on_startup=[create_tables])

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

register_exception_handlers(app)


@app.get('/api/appointments/')
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


@app.post('/api/appointments/', status_code=status.HTTP_201_CREATED)
async def create_new_appointment(
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment: Annotated[SimpleAppointment, Body()]
):
    """Запись на приём к мастеру"""
    try:
        # 1. Поиск пользователя по номеру телефона
        query = select(Customer).where(Customer.phone == appointment.phone)
        result = await session.execute(query)
        customer = result.scalar_one_or_none()
        
        # 2. Обработка пользователя
        if customer:
            # Если имя отличается - обновляем
            if customer.name != appointment.name:
                query = (
                    update(Customer)
                    .where(Customer.id == customer.id)
                    .values(name=appointment.name)
                )
                await session.execute(query)
        else:
            # Создаем нового пользователя
            customer = Customer(
                phone=appointment.phone,
                name=appointment.name
            )
            session.add(customer)
            await session.flush()  # Чтобы получить ID нового пользователя
        
        # 3. Создаем запись о назначении
        new_appointment = Appointment(
            customer_id=customer.id,
            service=appointment.service,
            master=appointment.master,
            datetime=appointment.datetime
        )
        session.add(new_appointment)
        
        # 4. Сохраняем изменения
        await session.commit()
        
        return {'message': 'OK'}
        
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f'Error creating appointment: {str(e)}'
        )


@app.patch('/api/appointments/{appointment_id}/')
async def update_appointment(
    session: Annotated[AsyncSession, Depends(get_session)],
    appointment_id: Annotated[int, Path()],
    new_appointment_info: Annotated[UpdateAppointment, Body()]
):
    """Обновление информации о записи по её id"""
    # Проверяем существование записи
    query = select(Appointment).where(Appointment.id == appointment_id)
    result = await session.execute(query)
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Appointment not found'
        )
    
    # Обновляем только указанные поля
    if new_appointment_info.service is not None:
        appointment.service = new_appointment_info.service
    if new_appointment_info.master is not None:
        appointment.master = new_appointment_info.master
    if new_appointment_info.datetime is not None:
        appointment.datetime = new_appointment_info.datetime
    if new_appointment_info.confirmed is not None:
        appointment.confirmed = new_appointment_info.confirmed
    
    await session.commit()
    
    return {'message': 'OK'}


@app.delete(
    '/api/appointments/{appointment_id}/',
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
    return None


@app.get('/api/customers/')
async def get_customers(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех клиентов, записывавшихся когда-либо"""
    query = select(Customer).order_by(Customer.id)
    result = await session.execute(query)
    return result.scalars().all()
