import os
from dotenv import load_dotenv

load_dotenv()

INSTANCE_ID = os.getenv("GREENAPI_INSTANCE_ID") or ""
API_TOKEN = os.getenv("GREENAPI_API_TOKEN") or ""
OWNER_ID = (os.getenv("OWNER_ID") or "").strip()

BACKEND_ENABLED = os.getenv("BACKEND_ENABLED", "0") == "1"
BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000").rstrip("/")
BACKEND_WS_URL = os.getenv("BACKEND_WS_URL", "ws://localhost:8000").rstrip("/")

AUTH_BACKEND_TOKEN = os.getenv("BACKEND_TOKEN")

# rate limit
RL_WINDOW_SEC = int(os.getenv("RL_WINDOW_SEC", "10"))
RL_MAX_ACTIONS = int(os.getenv("RL_MAX_ACTIONS", "5"))

DB_PATH = os.getenv("BOT_SQLITE_PATH", "bot_storage.db")
