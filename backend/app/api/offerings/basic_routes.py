from fastapi import APIRouter, status, Body, Query, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import OfferingCreate, OfferingGet, MasterDB, ServiceDB
from db.models import Offering, Master, Service
from db.postgresql import get_session
from db.queries import select_one, insert_one


basic_router = APIRouter()


@basic_router.get('/', response_model=list[OfferingGet])
async def get_all_offerings(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int | None, Query()] = None,
    service_id: Annotated[int | None, Query()] = None
):
    """Получение всех добавленных услуг мастеров с возможностью фильтрации
    по мастеру (master_id) или по услуге (service_id)
    """
    # Запрос с возможной фильтрацией
    query = select(Offering)
    if master_id is not None:
        query = query.where(Offering.master_id == master_id)
    if service_id is not None:
        query = query.where(Offering.service_id == service_id)
    # Выполнение запроса
    result = await session.execute(
        query
        .options(joinedload(Offering.master), joinedload(Offering.service))
    )
    return result.scalars().all()


@basic_router.post(
    '/',
    response_model=OfferingGet,
    status_code=status.HTTP_201_CREATED
)
async def create_new_offering(
    _: Annotated[None, Depends(verify_token)], # Верификация по токену
    session: Annotated[AsyncSession, Depends(get_session)],
    offering: Annotated[OfferingCreate, Body()]
):
    """Добавление новой услуги для мастера"""
    # Проверяем существование мастера в БД и получаем его
    master = await select_one(session, Master, {'id': offering.master_id})
    if master is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Master with such id doesn\'t exist'
        )
    # Проверяем существование услуги в БД и получаем её
    service = await select_one(session, Service, {'id': offering.service_id})
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Service with such id doesn\'t exist'
        )
    # Добавляем новую запись в БД
    new_offering = await insert_one(
        session=session,
        model=Offering,
        schema=offering,
        exists_filter={
            'master_id': offering.master_id,
            'service_id': offering.service_id
        },
        error_msg='The master already has such a service'
    )
    await session.refresh(master)
    await session.refresh(service)

    return {
        'id': new_offering.id,
        'master': MasterDB.model_validate(master),
        'service': ServiceDB.model_validate(service),
        'price': new_offering.price,
        'duration': new_offering.duration
    }
