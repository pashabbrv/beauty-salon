from fastapi import Header, HTTPException, status
from typing import Annotated
from dotenv import load_dotenv
from os import getenv


load_dotenv()
BACKEND_TOKEN = getenv('BACKEND_TOKEN', None)


async def verify_token(
    auth_token: Annotated[str | None, Header(alias='Auth-Token')] = None
):
    """Проверка токена аутентификации для доступа к эндпоинту"""
    if auth_token != BACKEND_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Access denied'
        )


async def verify_token_bool(
    auth_token: Annotated[str | None, Header(alias='Auth-Token')] = None
):
    """Проверка токен аутентификации для доступа к вебсокету"""
    return auth_token == BACKEND_TOKEN
