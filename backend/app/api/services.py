from fastapi import APIRouter, status, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import ServiceInfo, ServiceDB
from db.models import Service
from db.postgresql import get_session
from db.queries import select_all, insert_one


services_router = APIRouter(prefix='/services')


@services_router.get('/', response_model=list[ServiceDB])
async def get_all_services(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех предоставляемых услуг"""
    result = await select_all(session, Service)
    return result


@services_router.post(
    '/',
    response_model=ServiceDB,
    status_code=status.HTTP_201_CREATED
)
async def add_new_service(
    _: Annotated[None, Depends(verify_token)], # Верификация по токену
    session: Annotated[AsyncSession, Depends(get_session)],
    service: Annotated[ServiceInfo, Body()]
):
    """Добавление новой услуги с проверкой на существование такой"""
    new_service = await insert_one(
        session=session,
        model=Service,
        schema=service,
        exists_filter={'name': service.name},
        error_msg='Service with this name already exists'
    )
    return ServiceDB.model_validate(new_service, from_attributes=True)
