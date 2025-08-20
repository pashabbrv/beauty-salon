import sqlite3
import time
from typing import Optional

from .config import DB_PATH

def _conn():
    return sqlite3.connect(DB_PATH, timeout=10, check_same_thread=False)

def init_db():
    with _conn() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS processed_messages (
            id TEXT PRIMARY KEY,
            created_at INTEGER NOT NULL
        )""")
        c.execute("""CREATE TABLE IF NOT EXISTS ratelimit (
            key TEXT PRIMARY KEY,
            count INTEGER NOT NULL,
            window_start INTEGER NOT NULL
        )""")

def add_admin(phone: str) -> bool:
    try:
        with _conn() as c:
            c.execute("INSERT OR IGNORE INTO admins(phone) VALUES (?)", (phone,))
        return True
    except Exception:
        return False

def remove_admin(phone: str) -> bool:
    with _conn() as c:
        cur = c.execute("DELETE FROM admins WHERE phone = ?", (phone,))
        return cur.rowcount > 0

def is_admin(phone: str) -> bool:
    with _conn() as c:
        cur = c.execute("SELECT 1 FROM admins WHERE phone = ? LIMIT 1", (phone,))
        return cur.fetchone() is not None

def mark_processed(msg_id: str):
    with _conn() as c:
        c.execute("INSERT OR IGNORE INTO processed_messages(id, created_at) VALUES (?, ?)", (msg_id, int(time.time())))

def is_processed(msg_id: str) -> bool:
    with _conn() as c:
        cur = c.execute("SELECT 1 FROM processed_messages WHERE id = ? LIMIT 1", (msg_id,))
        return cur.fetchone() is not None

def rl_hit(key: str, window_sec: int, max_actions: int) -> tuple[bool, int]:
    """
    Возвращает (allowed, remaining)
    """
    now = int(time.time())
    with _conn() as c:
        row = c.execute("SELECT count, window_start FROM ratelimit WHERE key = ?", (key,)).fetchone()
        if not row:
            c.execute("INSERT INTO ratelimit(key, count, window_start) VALUES (?, ?, ?)", (key, 1, now))
            return True, max_actions - 1
        count, window_start = row
        if now - window_start >= window_sec:
            c.execute("UPDATE ratelimit SET count=?, window_start=? WHERE key=?", (1, now, key))
            return True, max_actions - 1
        if count >= max_actions:
            return False, 0
        c.execute("UPDATE ratelimit SET count=? WHERE key=?", (count + 1, key))
        return True, max_actions - (count + 1)
