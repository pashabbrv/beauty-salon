from fastapi import FastAPI, status, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, update
from sqlalchemy.exc import SQLAlchemyError
from typing import Annotated

from schemas import SimpleAppointment
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
async def get_appointments():
    async with session_factory() as session:
        try:
            # Делаем JOIN запрос между Appointment и Customer
            stmt = (
                select(Appointment, Customer)
                .join(Customer, Appointment.customer_id == Customer.id)
                .order_by(Appointment.datetime)
            )
            
            result = await session.execute(stmt)
            appointments_data = result.all()
            
            # Форматируем результат в нужный формат
            formatted_appointments = [
                {
                    "id": appointment.id,
                    "name": customer.name,
                    "phone": customer.phone,
                    "service": appointment.service,
                    "master": appointment.master,
                    "datetime": appointment.datetime.isoformat(),
                    "confirmed": appointment.confirmed
                }
                for appointment, customer in appointments_data
            ]
            
            return formatted_appointments
            
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )


@app.post('/api/appointments/', status_code=status.HTTP_201_CREATED)
async def create_new_appointment(appointment: Annotated[SimpleAppointment, Body()]):
    async with session_factory() as session:
        try:
            # 1. Поиск пользователя по номеру телефона
            stmt = select(Customer).where(Customer.phone == appointment.phone)
            result = await session.execute(stmt)
            customer = result.scalar_one_or_none()
            
            # 2. Обработка пользователя
            if customer:
                # Если имя отличается - обновляем
                if customer.name != appointment.name:
                    stmt = (
                        update(Customer)
                        .where(Customer.id == customer.id)
                        .values(name=appointment.name)
                    )
                    await session.execute(stmt)
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
