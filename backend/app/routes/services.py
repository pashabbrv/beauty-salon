from fastapi import (
    APIRouter, status, Body, Depends, HTTPException
)
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.schemas import NewService, DBService
from db.models import Service
from db.postgresql import get_session


services_router = APIRouter(prefix='/services')


@services_router.get('/', response_model=list[DBService])
async def get_services(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех предоставляемых услуг"""
    query = select(Service)
    result = await session.execute(query)
    return result.scalars().all()


@services_router.post(
    '/',
    response_model=DBService,
    status_code=status.HTTP_201_CREATED
)
async def create_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    service: Annotated[NewService, Body()]
):
    """Добавление новой услуги с проверкой на существование такой"""
    # Проверка существования услуги
    existing_service = await session.execute(
        select(Service).where(Service.name == service.name)
    )
    if existing_service.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail='Service with this name already exists'
        )

    # Создаём словарь с данными для вставки
    service_data = service.model_dump()
    
    # Вставка и возврат новой записи
    result = await session.execute(
        insert(Service)
        .values(**service_data)
        .returning(Service)
    )
    new_service = result.scalar_one()
    await session.commit()
    
    # Явно загружаем все атрибуты
    await session.refresh(new_service)
    
    # Конвертируем ORM-объект в Pydantic модель
    return DBService.model_validate(new_service, from_attributes=True)
