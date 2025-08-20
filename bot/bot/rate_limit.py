from .config import RL_WINDOW_SEC, RL_MAX_ACTIONS
from .storage import rl_hit

def allow(user_id: str, command: str) -> tuple[bool, int]:
    key = f"cmd:{command}:{user_id}"
    return rl_hit(key, RL_WINDOW_SEC, RL_MAX_ACTIONS)
