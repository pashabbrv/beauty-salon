import os
from dotenv import load_dotenv
from ..utils.phone import normalize_phone

load_dotenv()
OWNER_ID = normalize_phone(os.getenv("OWNER_ID"))

def is_owner(user_id: str) -> bool:
    return normalize_phone(user_id) == OWNER_ID
