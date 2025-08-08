from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from db.models import Customer
from db.postgresql import get_session


customers_router = APIRouter(prefix='/customers')

'''
@customers_router.get('/')
async def get_customers(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех клиентов, записывавшихся когда-либо"""
    query = select(Customer).order_by(Customer.id)
    result = await session.execute(query)
    return result.scalars().all()
'''