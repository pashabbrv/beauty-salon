import logging
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError


logger = logging.getLogger(__name__)


def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Обработчик всех ошибок SQLAlchemy"""
    logger.error(f'\nrequest: {request}\n-----\nexception: {str(exc)}')
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            'error': 'Database error'
        },
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Обработчик всех ошибок валидации pydantic"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            'error': 'Validation error',
            'details': [
                {
                    'field': err['loc'][-1],
                    'message': err['msg']
                } 
                for err in exc.errors()
            ]
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Обработчик всех неотловленных исключений"""
    logger.error(
        "Unhandled exception",
        exc_info=exc,
        extra={
            "request_method": request.method,
            "request_url": str(request.url),
            "client_host": request.client.host if request.client else None
        }
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Функция для регистрации всех обработчиков ошибок"""
    app.exception_handler(SQLAlchemyError)(sqlalchemy_exception_handler)
    app.exception_handler(RequestValidationError)(validation_exception_handler)
    app.exception_handler(Exception)(generic_exception_handler)
