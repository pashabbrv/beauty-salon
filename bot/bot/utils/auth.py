import os
from dotenv import load_dotenv
from ..utils.phone import normalize_phone
from ..backend_client import is_admin as backend_is_admin

load_dotenv()
OWNER_ID = normalize_phone(os.getenv("OWNER_ID"))

def is_owner(user_id: str) -> bool:
    return normalize_phone(user_id) == OWNER_ID

def is_admin(user_id: str) -> bool:
    uid = normalize_phone(user_id)
    return uid == OWNER_ID or backend_is_admin(uid)
