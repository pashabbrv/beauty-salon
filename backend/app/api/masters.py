from fastapi import APIRouter, status, Body, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.core.auth import verify_token
from app.core.schemas import MasterInfo, MasterDB
from app.db.models import Master
from app.db.postgresql import get_session
from app.db.queries import select_all, insert_one


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
