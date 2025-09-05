from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError


def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Обработчик всех ошибок SQLAlchemy"""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            'message': 'Database error'
        },
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Функция для регистрации всех обработчиков ошибок"""
    app.exception_handler(SQLAlchemyError)(sqlalchemy_exception_handler)
