from fastapi import (
    APIRouter,
    status,
    Body,
    Depends,
    Path,
    HTTPException,
    UploadFile,
    File,
)
from sqlalchemy import update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

import os
from uuid import uuid4
from pathlib import Path as SysPath

from core.auth import verify_token
from core.schemas import ServiceInfo, ServiceDB
from db.models import Service
from db.postgresql import get_session
from db.queries import select_all, select_one, insert_one


services_router = APIRouter(prefix="/services")

# Папка для фото услуг: backend/app/media/services
BASE_DIR = SysPath(__file__).resolve().parent.parent  # подстрой под свою структуру
MEDIA_DIR = BASE_DIR / "media"
SERVICES_MEDIA_DIR = MEDIA_DIR / "services"
SERVICES_MEDIA_DIR.mkdir(parents=True, exist_ok=True)


@services_router.get("/", response_model=list[ServiceDB])
async def get_all_services(
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Получение всех предоставляемых услуг"""
    result = await select_all(session, Service)
    return result


@services_router.post(
    "/",
    response_model=ServiceDB,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)],
)
async def add_new_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    service: Annotated[ServiceInfo, Body()],
):
    """Добавление новой услуги с проверкой на существование такой"""
    new_service = await insert_one(
        session=session,
        model=Service,
        schema=service,
        exists_filter={"name": service.name},
        error_msg="Service with this name already exists",
    )
    return ServiceDB.model_validate(new_service, from_attributes=True)


@services_router.put(
    "/{service_id}/",
    response_model=ServiceDB,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_token)],
)
async def update_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    service_id: Annotated[int, Path()],
    service: Annotated[ServiceInfo, Body()],
):
    """Изменение в существующей услуге всех полей"""
    query = (
        update(Service)
        .where(Service.id == service_id)
        .values(**service.model_dump())
        .returning(Service)
    )

    result = await session.execute(query)
    updated_service = result.scalar_one_or_none()

    if updated_service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    model_info = ServiceDB.model_validate(updated_service, from_attributes=True)
    await session.commit()

    return model_info


@services_router.delete(
    "/{service_id}/",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_token)],
)
async def delete_service(
    session: Annotated[AsyncSession, Depends(get_session)],
    service_id: Annotated[int, Path()],
):
    """Удаление существующей услуги"""
    existing_service = await select_one(session, Service, {"id": service_id})

    if existing_service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    await session.delete(existing_service)
    await session.commit()


# ====== НОВОЕ: загрузка/обновление фото услуги ======

@services_router.post(
    "/{service_id}/photo/",
    response_model=ServiceDB,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_token)],
)
async def upload_service_photo(
    session: Annotated[AsyncSession, Depends(get_session)],
    service_id: Annotated[int, Path()],
    file: UploadFile = File(...),
):
    """
    Загрузка/обновление фото услуги.
    Принимает multipart/form-data с полем `file`.
    """
    service = await select_one(session, Service, {"id": service_id})
    if service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    original_name = file.filename or ""
    _, ext = os.path.splitext(original_name)
    ext = ext.lower()

    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .jpg, .jpeg, .png, .webp files are allowed",
        )

    new_filename = f"service_{service_id}_{uuid4().hex}{ext}"
    file_path = SERVICES_MEDIA_DIR / new_filename

    content = await file.read()
    file_path.write_bytes(content)

    # относительный URL (так же, как у мастеров)
    relative_url = f"/media/services/{new_filename}"
    service.photo_url = relative_url

    await session.commit()
    await session.refresh(service)

    return ServiceDB.model_validate(service, from_attributes=True)
