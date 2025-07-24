import os
import time
import requests
from greenapi import receive_messages, send_whatsapp_message
from router import handle_message  # твой роутер команд

INSTANCE_ID = os.getenv("GREENAPI_INSTANCE_ID")
API_TOKEN = os.getenv("GREENAPI_API_TOKEN")


def poll_loop():
    print("[INFO] Бот запущен")

    while True:
        messages = receive_messages()

        if messages:
            print(f"[DEBUG] Получено {len(messages)} входящих")

        for msg in messages:
            try:
                body = msg["body"]
                chat_id = body["senderData"]["chatId"]

                message_data = body["messageData"]
                message_type = message_data.get("typeMessage")

                if message_type == "textMessage":
                    text = message_data["textMessageData"]["textMessage"]
                elif message_type == "extendedTextMessage":
                    text = message_data["extendedTextMessageData"]["text"]
                else:
                    print(f"[WARN] Неизвестный тип сообщения: {message_type}")
                    continue

                print(f"[DEBUG] Входящее: {chat_id} → {text}")

                reply = handle_message(chat_id, text)
                print(f"[DEBUG] Ответ: {reply}")
                send_whatsapp_message(chat_id, reply)

                # Удаление уведомления
                receipt_id = msg["receiptId"]
                delete_url = (
                    f"https://api.green-api.com/waInstance{INSTANCE_ID}"
                    f"/DeleteNotification/{API_TOKEN}/{receipt_id}"
                )
                requests.delete(delete_url)
                print(f"[DEBUG] Уведомление {receipt_id} удалено")

            except Exception as e:
                print(f"[ERROR] Ошибка в обработке: {e}")

        time.sleep(2)


if __name__ == "__main__":
    poll_loop()
