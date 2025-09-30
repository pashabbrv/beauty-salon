from fastapi import APIRouter, status, Body, Depends, Path, HTTPException
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from core.auth import verify_token
from core.schemas import MasterInfo, MasterDB
from db.models import Master
from db.postgresql import get_session
from db.queries import select_all, select_one, insert_one


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
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)]
)
async def add_new_master(
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


@masters_router.put(
    '/{master_id}/',
    response_model=MasterDB,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_token)]
)
async def update_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int, Path()],
    service: Annotated[MasterInfo, Body()]
):
    """Изменение у существующего мастера всех полей"""
    query = (
        update(Master)
        .where(Master.id == master_id)
        .values(**service.model_dump())
        .returning(Master)
    )
    
    result = await session.execute(query)
    updated_master = result.scalar_one_or_none()
    
    if updated_master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Master not found'
        )
    
    model_info = MasterDB.model_validate(updated_master, from_attributes=True)
    await session.commit()
    
    return model_info


@masters_router.delete(
    '/{master_id}/',
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_token)]
)
async def update_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int, Path()]
):
    """Удаление существующего мастера"""
    # Получаем мастера по ID
    existing_master = await select_one(
        session,
        Master,
        {'id': master_id}
    )
    
    if existing_master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Master not found'
        )
    
    # Удаляем мастера
    await session.delete(existing_master)
    await session.commit()
