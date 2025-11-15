# backend/app/api/masters.py
from fastapi import (
    APIRouter, status, Body, Depends, Path, HTTPException,
    UploadFile, File, Form
)
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from pathlib import Path
from uuid import uuid4
import os

from core.auth import verify_token
from core.schemas import MasterInfo, MasterDB
from db.models import Master
from db.postgresql import get_session
from db.queries import select_all, select_one, insert_one


masters_router = APIRouter(prefix='/masters')

# Папка для загрузки фото мастеров
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # backend/app
MEDIA_DIR = os.path.join(BASE_DIR, "media", "masters")
os.makedirs(MEDIA_DIR, exist_ok=True)


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
async def update_master(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int, Path()],
    master: Annotated[MasterInfo, Body()]
):
    """Изменение у существующего мастера всех полей"""
    query = (
        update(Master)
        .where(Master.id == master_id)
        .values(**master.model_dump())
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
async def delete_master(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int, Path()]
):
    """Удаление существующего мастера"""
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
    
    await session.delete(existing_master)
    await session.commit()


@masters_router.post(
    '/{master_id}/photo/',
    response_model=MasterDB,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_token)]
)
async def upload_master_photo(
    session: Annotated[AsyncSession, Depends(get_session)],
    master_id: Annotated[int, Path()],
    file: UploadFile = File(...),
    description: Annotated[str | None, Form()] = None,
):
    """
    Загрузка/обновление фото мастера и (опционально) его описания.
    Принимает multipart/form-data.
    """
    # Проверяем, что мастер существует
    master = await select_one(session, Master, {"id": master_id})
    if master is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Master not found'
        )

    # Проверяем расширение файла (базовая защита)
    filename = file.filename or ""
    _, ext = os.path.splitext(filename)
    if ext.lower() not in {'.jpg', '.jpeg', '.png', '.webp'}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Only .jpg, .jpeg, .png, .webp files are allowed'
        )

    # Генерируем уникальное имя файла
    new_filename = f"master_{master_id}_{uuid4().hex}{ext.lower()}"
    file_path = UPLOAD_DIR / new_filename

    # Сохраняем файл
    content = await file.read()
    file_path.write_bytes(content)

    # Формируем относительный URL (будет доступен по /media/masters/...)
    relative_url = f"/media/masters/{new_filename}"

    # Обновляем мастера
    master.photo_url = relative_url
    if description is not None:
        master.description = description

    await session.commit()
    await session.refresh(master)

    return MasterDB.model_validate(master, from_attributes=True)
