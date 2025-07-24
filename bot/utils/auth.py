import os

OWNER_ID = os.getenv("OWNER_ID")
ADMINS = set()

def is_owner(user_id: str) -> bool:
    return user_id == OWNER_ID

def is_admin(user_id: str) -> bool:
    return is_owner(user_id) or user_id in ADMINS

def add_admin(user_id: str):
    ADMINS.add(user_id)

def remove_admin(user_id: str):
    ADMINS.discard(user_id)
