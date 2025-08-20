from .utils.auth import is_admin, is_owner
from .backend_client import add_admin, remove_admin, export_clients
from .utils.phone import normalize_phone

HELP_TEXT = (
    "📋 Команды:\n"
    "/help — список команд\n"
    "/add_admin <номер>\n"
    "/remove_admin <номер>\n"
    "/export — экспорт клиентской базы"
)

def handle_message(user_id: str, text: str) -> str:
    text = (text or "").strip()

    # 1) /help всегда доступен
    if text.startswith("/help"):
        return HELP_TEXT

    # 2) Владелец — отдельный проход (БЕЗ общей проверки is_admin)
    if text.startswith("/add_admin"):
        if not is_owner(user_id):
            return "⛔ Только владелец может добавлять админов."
        parts = text.split()
        if len(parts) != 2:
            return "Использование: /add_admin 79XXXXXXXXX"
        phone = normalize_phone(parts[1])
        if not phone:
            return "❌ Некорректный номер."
        return "✅ Добавлен" if add_admin(phone) else "❌ Не удалось добавить"

    if text.startswith("/remove_admin"):
        if not is_owner(user_id):
            return "⛔ Только владелец может удалять админов."
        parts = text.split()
        if len(parts) != 2:
            return "Использование: /remove_admin 79XXXXXXXXX"
        phone = normalize_phone(parts[1])
        if not phone:
            return "❌ Некорректный номер."
        return "✅ Удалён" if remove_admin(phone) else "❌ Не удалось удалить"

    # 3) Остальное — только для админов/владельца
    if not is_admin(user_id):
        return "⛔ Доступ запрещён. Вы не администратор."

    if text.startswith("/export"):
        return export_clients()

    return "🤖 Команда не распознана. Напиши /help"
