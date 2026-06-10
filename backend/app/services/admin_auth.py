from datetime import datetime, timedelta, timezone
from hashlib import sha256
from secrets import token_urlsafe


def hash_password(raw_password: str) -> str:
    return sha256(raw_password.encode("utf-8")).hexdigest()


def verify_password(raw_password: str, stored_hash: str) -> bool:
    return hash_password(raw_password) == stored_hash


_SESSIONS: dict[str, datetime] = {}


def create_session_token(ttl_minutes: int) -> str:
    token = token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes)
    _SESSIONS[token] = expires_at
    return token


def is_session_valid(token: str) -> bool:
    expires_at = _SESSIONS.get(token)
    if not expires_at:
        return False
    if datetime.now(timezone.utc) > expires_at:
        _SESSIONS.pop(token, None)
        return False
    return True
