from commands.add_service import add_service
from utils.export_excel import export_clients
from utils.auth import is_admin

def handle_message(user_id: str, text: str) -> str:
    # if not is_admin(user_id):
    #     return "❌ Доступ запрещён. Вы не администратор."

    try:
        if text.startswith("/add_service"):
            _, name, price = text.split(maxsplit=2)
            return add_service(name, int(price))

        elif text.startswith("/export"):
            file_path = export_clients()
            return f"Клиенты экспортированы: {file_path}"

        elif text.startswith("/help"):
            return (
                "📋 Доступные команды:\n"
                "/add_service <название> <цена> — добавить услугу\n"
                "/export — экспорт клиентской базы в Excel\n"
                "/help — список доступных команд"
            )

        else:
            return "🤖 Команда не распознана. Напиши /help для списка."
    except Exception as e:
        return f"⚠️ Ошибка: {e}"
