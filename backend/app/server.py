# backend/app/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

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

# Папка для медиа-файлов (фото мастеров и т.п.)
BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Раздача статики по /media
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

# Регистрация всех кастомных обработчиков ошибок
register_exception_handlers(app)

# Регистрация всех api маршрутов
for router in api_routers:
    app.include_router(router, prefix='/api')
