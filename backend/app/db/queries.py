from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, insert
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Type, TypeVar


ORM = TypeVar('ORM', bound=DeclarativeBase)


async def select_all(session: AsyncSession, model: DeclarativeBase) -> list:
    """Получение списка всех записей определённой модели"""
    query = select(model)
    result = await session.execute(query)
    return result.scalars().all()


async def insert_one(
    session: AsyncSession,
    model: Type[ORM],
    schema: BaseModel,
    exists_filter: dict,
    error_msg: str = 'This object already exists'
) -> ORM:
    """Добавляет в таблицу определённой модели запись по схеме"""
    # Проверка, что такой объект уже существует
    existing_obj = await session.execute(
        select(model).filter_by(**exists_filter)
    )
    if existing_obj.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=error_msg
        )

    # Создаём словарь с данными для вставки
    data = schema.model_dump()
    
    # Вставка и возврат новой записи
    result = await session.execute(
        insert(model)
        .values(**data)
        .returning(model)
    )
    new_obj = result.scalar_one()
    await session.commit()
    
    # Явно загружаем все атрибуты
    await session.refresh(new_obj)
    
    return new_obj
