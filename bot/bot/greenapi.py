import logging
import requests

from .config import BASE_URL, API_TOKEN


logger = logging.getLogger(__name__)


def verify_api_token():
    """Verify if the Green API token is valid"""
    url = f"{BASE_URL}/getSettings/{API_TOKEN}"
    try:
        logger.info(f"Verifying API token with URL: {url}")
        r = requests.get(url)
        logger.info(f"Token verification response status: {r.status_code}")
        if r.status_code == 200:
            logger.info("API token is valid")
            return True
        else:
            logger.error(f"API token verification failed with status {r.status_code}")
            logger.error(f"Response: {r.text}")
            return False
    except requests.RequestException as e:
        logger.error(f"API token verification failed: {e}")
        return False


def send_whatsapp_message(chat_id_or_phone: str, text: str):
    # First verify the API token
    if not verify_api_token():
        logger.error("API token verification failed, cannot send message")
        return None
        
    # Try sending as a regular text message first
    url = f"{BASE_URL}/sendMessage/{API_TOKEN}"
    try:
        payload = {
            "message": text
        }
        
        # If it's already a chat ID (ends with @c.us), use chatId directly
        if chat_id_or_phone.endswith("@c.us"):
            payload["chatId"] = chat_id_or_phone
        else:
            # For phone numbers, we need to format it as a chat ID for Green API
            # The format is: phoneNumber@c.us
            clean_phone = ''.join(filter(str.isdigit, chat_id_or_phone))
            payload["chatId"] = f"{clean_phone}@c.us"
            
        logger.info(f"Sending WhatsApp message to {chat_id_or_phone}")
        logger.info(f"URL: {url}")
        logger.info(f"Payload: {payload}")
        
        # Green API uses token in URL, not in headers
        r = requests.post(url, json=payload)
        logger.info(f"Response status: {r.status_code}")
        if r.status_code != 200:
            logger.info(f"Response headers: {r.headers}")
            logger.info(f"Response text: {r.text}")
        r.raise_for_status()
        logger.debug(f"Sent → {chat_id_or_phone}: {text}")
        result = r.json()
        logger.info(f"Success response: {result}")
        return result
    except requests.RequestException as e:
        logger.error(f"sendMessage: {e}")
        if e.response:
            logger.error(f"Response status: {e.response.status_code}")
            logger.error(f"Response content: {e.response.text}")
        return None


def send_whatsapp_message_create_chat(phone: str, text: str):
    """Send message using createChat method for new contacts - NOT RECOMMENDED"""
    logger.warning("createChat method should not be used as fallback for sendMessage failures")
    return None