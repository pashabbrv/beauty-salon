import os
import requests
from typing import Optional, Tuple, Any

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL")
AUTH_TOKEN       = os.getenv("BACKEND_TOKEN")

APPOINTMENTS_PATH = "/api/appointments/"


def format_appointments_to_text(appointments):
    """
    Преобразует список записей в удобочитаемый текст для администратора
    """
    if not appointments:
        return "Нет записей для отображения"
    
    result = ["📋 СПИСОК ЗАПИСЕЙ\n"]
    
    for i, appointment in enumerate(appointments, 1):
        # Основная информация о записи
        confirmed_status = "✅ ПОДТВЕРЖДЕНА" if appointment.get('confirmed') else "❌ НЕ ПОДТВЕРЖДЕНА"
        
        appointment_text = f"""
📄 ЗАПИСЬ #{i} (ID: {appointment.get('id', 'N/A')})
{confirmed_status}
Дата создания: {appointment.get('created_at', 'N/A')}

👤 КЛИЕНТ:
• Имя: {appointment.get('name', 'N/A')}
• Телефон: {appointment.get('phone', 'N/A')}

💅 УСЛУГА:
• Название: {appointment['offering']['service']['name']}
• Цена: {appointment['offering']['price']} руб.
• Длительность: {appointment['offering']['duration']}

👩‍💼 МАСТЕР:
• Имя: {appointment['offering']['master']['name']}
• Телефон: {appointment['offering']['master']['phone']}
• ID: {appointment['offering']['master']['id']}

📅 ВРЕМЯ:
• Начало: {appointment['slot']['start']}
• Конец: {appointment['slot']['end']}
{'='*50}
"""
        result.append(appointment_text)
    
    # Статистика
    total = len(appointments)
    confirmed = sum(1 for app in appointments if app.get('confirmed'))
    not_confirmed = total - confirmed
    
    stats = f"""
📊 СТАТИСТИКА:
• Всего записей: {total}
• Подтвержденных: {confirmed}
• Неподтвержденных: {not_confirmed}
"""
    result.append(stats)
    
    return "\n".join(result)


def get_appointments(
    date: Optional[str] = None,          # "YYYY-MM-DD" или None
    confirmed: Optional[bool] = None,    # True/False/None
    timeout: int = 30
) -> Tuple[bool, Any]:
    """
    Делает GET /api/appointments с header Auth-Token.
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
