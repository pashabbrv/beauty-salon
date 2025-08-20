import os
import time
import requests
from dotenv import load_dotenv

# твои обёртки (оставляю как есть)
from greenapi import receive_messages, send_whatsapp_message
from router import handle_message  # твой роутер команд

load_dotenv()
INSTANCE_ID = os.getenv("GREENAPI_INSTANCE_ID")
API_TOKEN = os.getenv("GREENAPI_API_TOKEN")

if not INSTANCE_ID or not API_TOKEN:
    raise RuntimeError("GREENAPI_INSTANCE_ID / GREENAPI_API_TOKEN не заданы в .env")

# локальная защита от повторной обработки
PROCESSED_IDS: set[str] = set()


def _delete_notification(receipt_id: int | str):
    """Удаляет уведомление из очереди Green-API."""
    try:
        url = (
            f"https://api.green-api.com/waInstance{INSTANCE_ID}"
            f"/DeleteNotification/{API_TOKEN}/{receipt_id}"
        )
        r = requests.delete(url, timeout=10)
        r.raise_for_status()
        print(f"[DEBUG] Уведомление {receipt_id} удалено")
    except Exception as e:
        print(f"[WARN] Не удалось удалить уведомление {receipt_id}: {e}")


def _extract_text(message_data: dict) -> str | None:
    """Достаём текст из разных типов сообщений."""
    t = message_data.get("typeMessage")
    if t == "textMessage":
        return message_data.get("textMessageData", {}).get("textMessage")
    if t == "extendedTextMessage":
        return message_data.get("extendedTextMessageData", {}).get("text")
    # можно добавить обработку кнопок/шаблонов/медиа при необходимости
    return None


def poll_loop():
    print("[INFO] Бот запущен")

    while True:
        try:
            notifications = receive_messages() or []
        except Exception as e:
            print(f"[ERROR] receive_messages(): {e}")
            time.sleep(2)
            continue

        if notifications:
            print(f"[DEBUG] Получено {len(notifications)} уведомлений")

        for n in notifications:
            # У Green-API каждая "нотификация" обёрнута в объект с receiptId/body
            receipt_id = n.get("receiptId")
            body = n.get("body") or {}

            # фильтруем только входящие
            type_webhook = body.get("typeWebhook")
            if type_webhook != "incomingMessageReceived":
                # всё равно удаляем нотификацию, чтобы не копилась очередь
                if receipt_id is not None:
                    _delete_notification(receipt_id)
                continue

            # формируем ключ для дедупликации
            message_data = body.get("messageData") or {}
            msg_key = (
                message_data.get("stanzaId")
                or message_data.get("idMessage")
                or str(receipt_id)
            )
            if msg_key in PROCESSED_IDS:
                # на всякий случай удалим нотификацию
                if receipt_id is not None:
                    _delete_notification(receipt_id)
                continue
            PROCESSED_IDS.add(msg_key)

            try:
                # Номер отправителя без плюса. В senderData.sender приходит просто "7999..."
                sender_data = body.get("senderData") or {}
                user_id = str(sender_data.get("sender") or "").replace("+", "").strip()
                chat_id = sender_data.get("chatId")  # если нужно для ответов API
                if not user_id:
                    print("[WARN] Не удалось определить user_id, пропускаю")
                    if receipt_id is not None:
                        _delete_notification(receipt_id)
                    continue

                text = _extract_text(message_data)
                if text is None:
                    print(f"[WARN] Неизвестный/неподдерживаемый тип сообщения: {message_data.get('typeMessage')}")
                    # мягко отвечать не будем; просто удалим уведомление
                    if receipt_id is not None:
                        _delete_notification(receipt_id)
                    continue

                text = text.strip()
                print(f"[IN ] {user_id} → {text}")

                # роутер твоих команд. Внутри handle_message сравнивай user_id с OWNER_ID и т.п.
                reply = handle_message(user_id, text)
                print(f"[OUT] {user_id} ← {reply}")

                # отвечаем в тот же чат. Если твой send_whatsapp_message ждёт chatId — передай chat_id.
                # Ниже — вариант с chat_id; если твоя обёртка ждёт телефон — передай user_id.
                send_whatsapp_message(chat_id or user_id, reply)

            except Exception as e:
                print(f"[ERROR] Ошибка обработки уведомления {receipt_id}: {e}")

            finally:
                # удаляем нотификацию в любом случае, чтобы не дублировалось
                if receipt_id is not None:
                    _delete_notification(receipt_id)

        time.sleep(1.5)


if __name__ == "__main__":
    poll_loop()
