import requests
from typing import Optional
from .config import BACKEND_ENABLED, BACKEND_BASE_URL
from .utils.phone import normalize_phone
from . import storage

# --- Админы ---
def add_admin(phone: str) -> bool:
    phone = normalize_phone(phone)
    if not BACKEND_ENABLED:
        return storage.add_admin(phone)
    ...
def remove_admin(phone: str) -> bool:
    phone = normalize_phone(phone)
    if not BACKEND_ENABLED:
        return storage.remove_admin(phone)
    ...
def is_admin(phone: str) -> bool:
    phone = normalize_phone(phone)
    if not BACKEND_ENABLED:
        return storage.is_admin(phone)

# --- Экспорт клиентов ---
def export_clients() -> str:
    """
    Возвращает человекочитаемый результат.
    В локальном режиме тут можно дернуть ваш старый utils.export_excel.
    В backend-режиме — шлём команду бекенду.
    """
    if not BACKEND_ENABLED:
        try:
            from utils.export_excel import export_clients as local_export  # если есть
            return local_export()
        except Exception:
            return "⚠️ Локальный экспорт недоступен"
    try:
        r = requests.post(f"{BACKEND_BASE_URL}/clients/export", timeout=15)
        if r.ok:
            return "📁 Экспорт инициирован на сервере"
        return f"❌ Ошибка экспорта: {r.status_code}"
    except Exception:
        return "❌ Не удалось вызвать экспорт на бекенде"
