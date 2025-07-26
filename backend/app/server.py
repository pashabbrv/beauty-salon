from datetime import date, timedelta
from fastapi import FastAPI, status, Body, Query, Path, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from typing import Annotated

from schemas import SimpleAppointment, UpdateAppointment
from db.postgresql import session_factory, create_tables
from db.models import Customer, Appointment


app = FastAPI(on_startup=[create_tables])

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/api/appointments/')
async def get_appointments(
    date: Annotated[date | None, Query()] = None,
    confirmed: Annotated[bool | None, Query()] = None
):
    async with session_factory() as session:
        try:
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
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f'Database error: {str(e)}'
            )


@app.post('/api/appointments/', status_code=status.HTTP_201_CREATED)
async def create_new_appointment(appointment: Annotated[SimpleAppointment, Body()]):
    async with session_factory() as session:
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
            
        except SQLAlchemyError as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f'Database error: {str(e)}'
            )
        except Exception as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f'Error creating appointment: {str(e)}'
            )


@app.patch('/api/appointments/{appointment_id}/')
async def update_appointment(
    appointment_id: Annotated[int, Path()],
    new_appointment_info: Annotated[UpdateAppointment, Body()]
):
    async with session_factory() as session:
        try:
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
            
        except SQLAlchemyError as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f'Database error: {str(e)}'
            )


@app.delete(
    '/api/appointments/{appointment_id}/',
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_appointment(appointment_id: Annotated[int, Path()]):
    async with session_factory() as session:
        try:
            # Прямое удаление без предварительной проверки
            query = delete(Appointment).where(Appointment.id == appointment_id)
            result = await session.execute(query)
            
            if result.rowcount == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail='Appointment not found'
                )
            
            await session.commit()
            return None
            
        except SQLAlchemyError as e:
            await session.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f'Database error: {str(e)}'
            )


@app.get('/api/customers/')
async def get_customers():
    async with session_factory() as session:
        try:
            # Создаем запрос для получения всех клиентов
            query = select(Customer).order_by(Customer.id)
            result = await session.execute(query)
            customers = result.scalars().all()
            
            # Форматируем результат в нужный JSON-формат
            customers_list = [
                {
                    'id': customer.id,
                    'name': customer.name,
                    'phone': customer.phone
                }
                for customer in customers
            ]
            
            return customers_list
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f'Database error: {str(e)}'
            )
