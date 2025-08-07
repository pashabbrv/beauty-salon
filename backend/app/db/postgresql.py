from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from . import POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_NAME
from .models import Base


URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_NAME}'

engine = create_async_engine(
    url=URL,
    echo=True
)

session_factory = async_sessionmaker(engine, class_=AsyncSession)


async def get_session():
    """Получение соединения с базой данных"""
    async with session_factory() as session:
        try:
            yield session
        except SQLAlchemyError:
            session.rollback()
            raise SQLAlchemyError()
            


async def create_tables():
    """Создание всех таблиц"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
