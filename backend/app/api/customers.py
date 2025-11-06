from fastapi import APIRouter, Depends, Body, Path, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import CustomerGet, CustomersStatusUpdate, CustomerStatusTypes
from db.models import Customer
from db.postgresql import get_session
from db.queries import select_all, select_one


customers_router = APIRouter(prefix='/customers')


@customers_router.get(
    '/',
    response_model=list[CustomerGet],
    dependencies=[Depends(verify_token)]
)
async def get_customers(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех клиентов, записывавшихся когда-либо"""
    customers = await select_all(session, Customer)
    return customers


@customers_router.get(
    '/statuses/',
    dependencies=[Depends(verify_token)]
)
async def get_available_statuses():
    """Получение всех доступных статусов клиентов"""
    return {"statuses": CustomerStatusTypes.get_all_statuses()}


@customers_router.patch(
    '/{phone}/status/',
    response_model=CustomerGet,
    dependencies=[Depends(verify_token)]
)
async def change_customers_status(
    session: Annotated[AsyncSession, Depends(get_session)],
    phone: Annotated[str, Path()],
    new_status: Annotated[CustomersStatusUpdate, Body()]
):
    """Обновление статуса у пользователя по номеру телефона"""
    customer = await select_one(session, Customer, {'phone': phone})
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Customer with such phone doesn\'t exist'
        )
    
    customer.status = new_status.status
    await session.commit()
    await session.refresh(customer)
    return customer


# New endpoints for specific status types
@customers_router.post(
    '/{phone}/status/new/',
    response_model=CustomerGet,
    dependencies=[Depends(verify_token)]
)
async def set_customer_status_new(
    session: Annotated[AsyncSession, Depends(get_session)],
    phone: Annotated[str, Path()]
):
    """Установка статуса 'new' для клиента по номеру телефона"""
    return await update_customer_status(session, phone, CustomerStatusTypes.NEW)


@customers_router.post(
    '/{phone}/status/regular/',
    response_model=CustomerGet,
    dependencies=[Depends(verify_token)]
)
async def set_customer_status_regular(
    session: Annotated[AsyncSession, Depends(get_session)],
    phone: Annotated[str, Path()]
):
    """Установка статуса 'regular' для клиента по номеру телефона"""
    return await update_customer_status(session, phone, CustomerStatusTypes.REGULAR)


@customers_router.post(
    '/{phone}/status/capricious/',
    response_model=CustomerGet,
    dependencies=[Depends(verify_token)]
)
async def set_customer_status_capricious(
    session: Annotated[AsyncSession, Depends(get_session)],
    phone: Annotated[str, Path()]
):
    """Установка статуса 'capricious' для клиента по номеру телефона"""
    return await update_customer_status(session, phone, CustomerStatusTypes.CAPRICIOUS)


# Helper function to update customer status
async def update_customer_status(session: AsyncSession, phone: str, status: str):
    """Вспомогательная функция для обновления статуса клиента"""
    customer = await select_one(session, Customer, {'phone': phone})
    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Customer with such phone doesn\'t exist'
        )
    
    customer.status = status
    await session.commit()
    await session.refresh(customer)
    return customer