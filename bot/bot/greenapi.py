import logging
import requests

from .config import BASE_URL, API_TOKEN


logger = logging.getLogger(__name__)


def send_whatsapp_message(chat_id_or_phone: str, text: str):
    url = f"{BASE_URL}/sendMessage/{API_TOKEN}"
    try:
        payload = {"message": text}
        if chat_id_or_phone.endswith("@c.us"):
            payload["chatId"] = chat_id_or_phone
        else:
            payload["phone"] = chat_id_or_phone
        r = requests.post(url, json=payload)
        r.raise_for_status()
        logger.debug(f"Sent → {chat_id_or_phone}: {text}")
    except requests.RequestException as e:
        logger.error(f"sendMessage: {e}")
