from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from . import POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_NAME
from .models import Base


URL = f'postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_NAME}'

engine = create_async_engine(
    url=URL,
    echo=True
)

session_factory = async_sessionmaker(engine)


async def create_tables():
    """Создание всех таблиц"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
