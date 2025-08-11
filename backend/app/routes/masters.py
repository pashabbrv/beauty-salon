from fastapi import APIRouter, status, Body, Path, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import MasterInfo, MasterDB, OfferingGetService
from db.models import Master, Offering
from db.postgresql import get_session
from db.queries import select_all, insert_one


masters_router = APIRouter(prefix='/masters')


@masters_router.get('/', response_model=list[MasterDB])
async def get_all_masters(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех добавленных мастеров"""
    result = await select_all(session, Master)
    return result


@masters_router.post(
    '/',
    response_model=MasterDB,
    status_code=status.HTTP_201_CREATED
)
async def add_new_master(
    _: Annotated[None, Depends(verify_token)], # Верификация по токену
    session: Annotated[AsyncSession, Depends(get_session)],
    master: Annotated[MasterInfo, Body()]
):
    """Добавление нового мастера"""
    new_master = await insert_one(
        session=session,
        model=Master,
        schema=master,
        exists_filter={'phone': master.phone},
        error_msg='Master with this phone already exists'
    )
    return MasterDB.model_validate(new_master, from_attributes=True)


@masters_router.get(
    '/{master_id}/offerings/',
    response_model=list[OfferingGetService]
)
async def get_all_services_from_master(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int, Path()]
):
    '''Получение всех услуг от определённого мастера'''
    result = await session.execute(
        select(Master)
        .where(Master.id == master_id)
        .options(selectinload(Master.offerings).selectinload(Offering.service))
    )
    master = result.scalar_one_or_none()
    if master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Master with such id doesn\'t exist'
        )
    return master.offerings
