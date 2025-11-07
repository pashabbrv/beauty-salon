from fastapi import APIRouter, status, Body, Depends, Path, HTTPException
from sqlalchemy import update, delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List

from core.auth import verify_token
from core.schemas import ProductCreate, ProductUpdate, ProductDB
from db.models import Product
from db.postgresql import get_session
from db.queries import select_all, select_one, insert_one


products_router = APIRouter(prefix='/products')


@products_router.get('/', response_model=List[ProductDB])
async def get_all_products(
    session: Annotated[AsyncSession, Depends(get_session)]
):
    """Получение всех товаров"""
    result = await select_all(session, Product)
    return result


@products_router.post(
    '/',
    response_model=ProductDB,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(verify_token)]
)
async def add_new_product(
    session: Annotated[AsyncSession, Depends(get_session)],
    product: Annotated[ProductCreate, Body()]
):
    """Добавление нового товара"""
    new_product = Product(
        name=product.name,
        price=product.price,
        quantity=product.quantity,
        unit=product.unit
    )
    
    session.add(new_product)
    await session.commit()
    await session.refresh(new_product)
    
    return ProductDB.model_validate(new_product, from_attributes=True)


@products_router.put(
    '/{product_id}/',
    response_model=ProductDB,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(verify_token)]
)
async def update_product(
    session: Annotated[AsyncSession, Depends(get_session)],
    product_id: Annotated[int, Path()],
    product: Annotated[ProductUpdate, Body()]
):
    """Изменение информации о товаре"""
    # Получаем товар по ID
    existing_product = await select_one(
        session,
        Product,
        {'id': product_id}
    )
    
    if existing_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Product not found'
        )
    
    # Обновляем поля, которые были переданы
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(existing_product, key, value)
    
    session.add(existing_product)
    await session.commit()
    await session.refresh(existing_product)
    
    return ProductDB.model_validate(existing_product, from_attributes=True)


@products_router.delete(
    '/{product_id}/',
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(verify_token)]
)
async def delete_product(
    session: Annotated[AsyncSession, Depends(get_session)],
    product_id: Annotated[int, Path()]
):
    """Удаление товара"""
    # Получаем товар по ID
    existing_product = await select_one(
        session,
        Product,
        {'id': product_id}
    )
    
    if existing_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Product not found'
        )
    
    # Удаляем товар
    await session.delete(existing_product)
    await session.commit()