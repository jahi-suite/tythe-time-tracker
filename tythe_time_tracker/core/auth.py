"""Password hashing and verification using bcrypt."""

import logging
from typing import Optional, List

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


def create_user(username: str, password: str, display_name: str, role: str) -> tuple[bool, str]:
    """Create a new user account.

    Returns (True, success_message) or (False, error_message).
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    if not username.strip() or not password or not display_name.strip():
        return False, "Username, password, and display name are required."
    if role not in ("employee", "manager"):
        return False, "Role must be 'employee' or 'manager'."

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("create_user: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        password_hash = hash_password(password)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                INSERT INTO {DatabaseConstants.USERS_TABLE}
                    (username, password_hash, role, display_name)
                VALUES (%s, %s, %s, %s)
                """,
                (username.strip(), password_hash, role, display_name.strip()),
            )
        return True, f"User '{username.strip()}' created successfully."
    except Exception as e:
        err_str = str(e)
        if "unique" in err_str.lower() or "duplicate" in err_str.lower():
            return False, f"Username '{username.strip()}' is already taken."
        logger.error("create_user: error: %s", e)
        return False, f"Failed to create user: {err_str}"
    finally:
        conn.close()


def get_all_users() -> List[dict]:
    """Return all users as a list of dicts (id, username, role, display_name, active)."""
    from ..database.connection import DatabaseConnection, get_db_connection

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("get_all_users: DB connection failed: %s", err)
        return []

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT id, username, role, display_name, active
                FROM {DatabaseConstants.USERS_TABLE}
                ORDER BY role, display_name
                """
            )
            rows = cursor.fetchall()
        return [
            {
                "id": str(row[0]),
                "username": row[1],
                "role": row[2],
                "display_name": row[3],
                "active": row[4],
            }
            for row in rows
        ]
    except Exception as e:
        logger.error("get_all_users: error: %s", e)
        return []
    finally:
        conn.close()


def set_user_active(user_id: str, active: bool) -> tuple[bool, str]:
    """Activate or deactivate a user account.

    Returns (True, success_message) or (False, error_message).
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("set_user_active: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE {DatabaseConstants.USERS_TABLE}
                SET active = %s
                WHERE id = %s
                """,
                (active, user_id),
            )
            if cursor.rowcount == 0:
                return False, "User not found."
        status = "activated" if active else "deactivated"
        return True, f"User {status} successfully."
    except Exception as e:
        logger.error("set_user_active: error: %s", e)
        return False, f"Failed to update user: {e}"
    finally:
        conn.close()
