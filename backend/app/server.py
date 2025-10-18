from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.exceptions import register_exception_handlers
from db.postgresql import create_tables
from api import routers as api_routers


app = FastAPI(on_startup=[create_tables])

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Регистрация всех кастомных обработчиков ошибок
register_exception_handlers(app)

# Регистрация всех api маршрутов
for router in api_routers:
    app.include_router(router, prefix='/api')
