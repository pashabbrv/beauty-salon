import os
from dotenv import load_dotenv


load_dotenv()
OWNER_ID = os.getenv("OWNER_ID")


def is_owner(user_id: str) -> bool:
    return user_id == OWNER_ID
