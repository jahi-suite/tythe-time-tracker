"""Password hashing and verification using bcrypt."""

import logging
from typing import Optional

import bcrypt

from .constants import DatabaseConstants

logger = logging.getLogger(__name__)


def hash_password(plain: str) -> str:
    """Hash a plaintext password and return the bcrypt hash as a string."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Check a plaintext password against a bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def authenticate_user(username: str, password: str) -> Optional[dict]:
    """Look up an active user by username and verify their password.

    Returns a dict with id, username, role, display_name on success,
    or None if credentials are invalid or the user is inactive.
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("authenticate_user: DB connection failed: %s", err)
        return None

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT id, username, password_hash, role, display_name
                FROM {DatabaseConstants.USERS_TABLE}
                WHERE username = %s AND active = true
                """,
                (username.strip(),),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        user_id, db_username, password_hash, role, display_name = row
        if not verify_password(password, password_hash):
            return None

        return {
            "id": str(user_id),
            "username": db_username,
            "role": role,
            "display_name": display_name,
        }
    except Exception as e:
        logger.error("authenticate_user: error during lookup: %s", e)
        return None
    finally:
        conn.close()
