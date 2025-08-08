from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.exceptions import register_exception_handlers
from db.postgresql import create_tables
from routes import routers


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

# Регистрация всех маршрутов
for router in routers:
    app.include_router(router, prefix='/api')
