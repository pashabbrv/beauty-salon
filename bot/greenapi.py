import os
import requests

INSTANCE_ID = os.getenv("GREENAPI_INSTANCE_ID")
API_TOKEN = os.getenv("GREENAPI_API_TOKEN")

BASE_URL = f"https://api.green-api.com/waInstance{INSTANCE_ID}"

def send_whatsapp_message(chat_id: str, message: str):
    """
    chat_id: номер в формате '79991234567@c.us'
    """
    url = f"{BASE_URL}/SendMessage/{API_TOKEN}"
    payload = {
        "chatId": chat_id,
        "message": message
    }
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        print(f"[DEBUG] Сообщение отправлено → {chat_id}: {message}")
        return response.json()
    except requests.RequestException as e:
        print("[ERROR] Ошибка при отправке сообщения:", e)
        return None


def receive_messages():
    url = f"{BASE_URL}/ReceiveNotification/{API_TOKEN}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print("[DEBUG] Получен ответ от GreenAPI:", data)
        if data is None:
            return []
        return [data]
    except requests.RequestException as e:
        print("[ERROR] Ошибка при получении сообщений:", e)
        return []
