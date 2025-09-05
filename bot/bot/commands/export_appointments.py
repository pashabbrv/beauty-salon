import os
import requests
from typing import Optional, Tuple, Any
from ..utils.excel_export import create_appointments_excel, cleanup_temp_file

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")
AUTH_TOKEN       = os.getenv("BACKEND_TOKEN")

APPOINTMENTS_PATH = "/api/appointments/"


def create_appointments_excel_file(appointments):
    """
    Создает Excel файл с записями и возвращает путь к файлу
    """
    if not appointments:
        return None
    
    try:
        file_path = create_appointments_excel(appointments)
        return file_path
    except Exception as e:
        print(f"[ERROR] Ошибка создания Excel файла: {e}")
        return None


def format_appointments_compact(appointments):
    """
    Компактный формат для быстрого просмотра
    """
    if not appointments:
        return "Нет записей"
    
    result = ["📋 ЗАПИСИ:\n"]
    
    for i, appointment in enumerate(appointments, 1):
        status = "✅" if appointment.get('confirmed') else "❌"
        date = appointment['slot']['start'].split('T')[0]  # Только дата
        time = appointment['slot']['start'].split('T')[1][:5]  # Только время
        
        appointment_text = (
            f"{i}. {status} {date} {time} "
            f"- {appointment.get('name')} "
            f"({appointment['offering']['service']['name']}) "
            f"у {appointment['offering']['master']['name']}"
        )
        result.append(appointment_text)
    
    return "\n".join(result)


def get_appointments(
    date: Optional[str] = None,          # "YYYY-MM-DD" или None
    confirmed: Optional[bool] = None,    # True/False/None
    timeout: int = 30
) -> Tuple[bool, Any]:
    """
    Делает GET /api/appointments/ с header Auth-Token.
    Возвращает (ok, data|error_text).
    ok=True  -> data = JSON/obj
    ok=False -> data = текст ошибки (str)
    """
    if not BACKEND_BASE_URL:
        return False, "BACKEND_BASE_URL не задан в .env"
    if not AUTH_TOKEN:
        return False, "AUTH TOKEN не задан (.env BACKEND_AUTH_TOKEN или BACKEND_TOKEN)"

    url = f"{BACKEND_BASE_URL}{APPOINTMENTS_PATH}"

    # Собираем query-параметры согласно документации
    params = {}
    if date is not None and date != "":
        params["date"] = date
    if confirmed is not None:
        # большинство беков понимают true/false как булево, но безопасно отдать строку
        params["confirmed"] = "true" if confirmed else "false"

    headers = {"Auth-Token": AUTH_TOKEN}

    try:
        resp = requests.get(url, params=params, headers=headers, timeout=timeout)
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