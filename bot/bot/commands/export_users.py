import os
import requests
from typing import Optional, Tuple, Any
from ..utils.excel_export import create_customers_excel, cleanup_temp_file

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")
AUTH_TOKEN       = os.getenv("BACKEND_TOKEN")

CUSTOMERS_PATH = "/api/customers/"


def create_customers_excel_file(customers):
    """
    Создает Excel файл с клиентами и возвращает путь к файлу
    """
    if not customers:
        return None
    
    try:
        file_path = create_customers_excel(customers)
        return file_path
    except Exception as e:
        print(f"[ERROR] Ошибка создания Excel файла: {e}")
        return None


def format_customers_compact(users):
    """
    Компактный формат списка пользователей
    """
    if not users:
        return "Нет пользователей"
    
    result = ["👥 ПОЛЬЗОВАТЕЛИ:\n"]
    
    # Сортируем по статусу (активные сначала) и дате
    sorted_users = sorted(users, key=lambda x: (x.get('status') != 'active', x.get('created_at', '')), reverse=True)
    
    for i, user in enumerate(sorted_users, 1):
        status_emoji = "✅" if user.get('status') == 'active' else "🚫"
        
        # Форматируем дату
        created_date = user.get('created_at', '').split('T')[0] if user.get('created_at') else 'N/A'
        
        user_text = (
            f"{i}. {status_emoji} {user.get('name', 'Без имени')} "
            f"({user.get('phone', 'Без телефона')}) "
            f"- зарегистрирован: {created_date}"
        )
        result.append(user_text)
    
    return "\n".join(result)


def get_customers(
    timeout: int = 30
) -> Tuple[bool, Any]:
    """
    Делает GET /api/customers/ с header Auth-Token.
    Возвращает (ok, data|error_text).
    ok=True  -> data = JSON/obj
    ok=False -> data = текст ошибки (str)
    """
    if not BACKEND_BASE_URL:
        return False, "BACKEND_BASE_URL не задан в .env"
    if not AUTH_TOKEN:
        return False, "AUTH TOKEN не задан (.env BACKEND_AUTH_TOKEN или BACKEND_TOKEN)"

    url = f"{BACKEND_BASE_URL}{CUSTOMERS_PATH}"

    headers = {"Auth-Token": AUTH_TOKEN}

    try:
        resp = requests.get(url, headers=headers, timeout=timeout)
        # 422 = Validation Error по доке — вернём текст
        if resp.status_code != 200:
            return False, f"HTTP {resp.status_code}: {resp.text}"
        # предполагаем JSON
        ctype = resp.headers.get("Content-Type", "")
        if "application/json" in ctype.lower():
            return True, resp.json()
        # если не json — вернём как текст
        return True, resp.text
    except requests.RequestException as e:
        return False, f"request error: {e}"
