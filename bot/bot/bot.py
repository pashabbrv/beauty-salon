# bot.py
import os
import time
import json
import unicodedata
import requests
from dotenv import load_dotenv
from bot.router import handle_message
from .storage import init_db
from .utils.auth import OWNER_ID
from .router import handle_message
# from .greenapi import receive_messages, send_whatsapp_message

print(f"[INFO] router loaded from: {handle_message.__module__}, OWNER_ID={OWNER_ID}")

load_dotenv()
INSTANCE_ID = os.getenv("GREENAPI_INSTANCE_ID")
API_TOKEN   = os.getenv("GREENAPI_API_TOKEN")

BASE = f"https://api.green-api.com/waInstance{INSTANCE_ID}"

# ====== простейший роутер (если у тебя свой router.py — подключи его здесь) ======
HELP_TEXT = (
    "📋 Команды:\n"
    "/help — список команд\n"
    "/add_admin <номер>\n"
    "/remove_admin <номер>\n"
    "/export — экспорт клиентской базы"
)
def handle_message(user_id: str, text: str) -> str:
    # отвечаем только на команды
    if not text.startswith("/"):
        return ""  # пустая строка = не отвечаем
    if text.startswith("/help"):
        return HELP_TEXT
    return "🤖 Команда не распознана. Напиши /help"

# ====== утилиты Green-API ======
def _receive_one():
    try:
        url = f"{BASE}/ReceiveNotification/{API_TOKEN}"
        r = requests.get(url, timeout=25)  # long-poll
        r.raise_for_status()
        data = r.json()  # либо None
        if data:
            print("[DEBUG] RAW:", json.dumps(data, ensure_ascii=False))
        return data
    except Exception as e:
        print(f"[ERROR] ReceiveNotification: {e}")
        return None

def _delete_notification(receipt_id):
    if receipt_id is None:
        return
    try:
        url = f"{BASE}/DeleteNotification/{API_TOKEN}/{receipt_id}"
        r = requests.delete(url, timeout=10)
        r.raise_for_status()
        print(f"[DEBUG] DeleteNotification {receipt_id} OK")
    except requests.RequestException as e:
        print(f"[WARN] DeleteNotification {receipt_id} failed: {e}")

def _send_text(chat_id_or_phone: str, text: str):
    if not text:
        return  # ничего не слать
    try:
        url = f"{BASE}/sendMessage/{API_TOKEN}"
        payload = {"message": text}
        if chat_id_or_phone.endswith("@c.us"):
            payload["chatId"] = chat_id_or_phone
        else:
            payload["phone"] = chat_id_or_phone
        r = requests.post(url, json=payload, timeout=15)
        r.raise_for_status()
        print(f"[DEBUG] Sent → {chat_id_or_phone}: {text}")
    except requests.RequestException as e:
        print(f"[ERROR] sendMessage: {e}")

# ====== парсинг ======
def _extract_text(message_data: dict) -> str | None:
    """
    Возвращает нормализованный текст сообщения или None.
    Поддерживает textMessage и extendedTextMessage.
    """
    t = (message_data or {}).get("typeMessage")
    if t == "textMessage":
        raw = (message_data.get("textMessageData") or {}).get("textMessage")
    elif t == "extendedTextMessage":
        raw = (message_data.get("extendedTextMessageData") or {}).get("text")
    else:
        return None

    if raw is None:
        return None

    # нормализация юникода (слэш может быть похожим символом)
    s = unicodedata.normalize("NFKC", str(raw)).strip()

    # единая обработка help без слэша
    lowered = s.lower()
    if lowered == "help":
        s = "/help"

    # если команда с лишними пробелами типа "/help   "
    if s.startswith("/"):
        s = "/" + s[1:].lstrip()

    return s

# ====== дедуп (в памяти) ======
PROCESSED = set()
def _msg_key(body: dict) -> str:
    md = body.get("messageData") or {}
    # старайся использовать stanzaId; если его нет, idMessage; иначе receiptId
    return md.get("stanzaId") or md.get("idMessage") or str(body.get("timestamp") or "")  # fallback

# ====== основной цикл ======
# init_db()
def poll_loop():
    if not INSTANCE_ID or not API_TOKEN:
        raise RuntimeError("GREENAPI_INSTANCE_ID / GREENAPI_API_TOKEN не заданы в .env")
    print("[INFO] Бот запущен")

    while True:
        notif = _receive_one()
        if notif is None:
            time.sleep(1.0)
            continue

        receipt_id = notif.get("receiptId")
        body = notif.get("body") or {}

        try:
            twh = body.get("typeWebhook")
            if twh != "incomingMessageReceived":
                print(f"[DEBUG] skip typeWebhook={twh}")
                continue

            key = _msg_key(body)
            if key and key in PROCESSED:
                print(f"[DEBUG] dup {key}, skip")
                continue
            if key:
                PROCESSED.add(key)

            sender_data = body.get("senderData") or {}
            message_data = body.get("messageData") or {}
            user_id = str(sender_data.get("sender") or "").replace("+", "").strip()
            chat_id = sender_data.get("chatId")  # '79...@c.us'

            text = _extract_text(message_data)
            print(f"[IN ] user={user_id} type={message_data.get('typeMessage')} text={text!r}")

            if not user_id or text is None:
                # не текст — не отвечаем
                continue

            reply = handle_message(user_id, text)
            print(f"[OUT] user={user_id} reply={reply!r}")
            _send_text(chat_id or user_id, reply)

        except Exception as e:
            print(f"[ERROR] Обработка: {e}")
        finally:
            _delete_notification(receipt_id)

if __name__ == "__main__":
    poll_loop()

# Реализуешь REST эндпоинты на бекенде:

# POST /admins {phone} / DELETE /admins/{phone} / GET /admins/{phone}

# POST /clients/export

# Меняешь .env: BACKEND_ENABLED=1 и (при необходимости) отключаешь локальный utils.export_excel.

# Всё остальное уже готово — бот начнёт ходить в бекенд без переписывания команд.

# Если нужно — добавлю команду /send_otp <phone> и 
# интеграцию с OTP (из прошлой ветки), а также отправку Excel-файла в чат.