"""Password hashing and verification using bcrypt."""

import logging
from decimal import Decimal
from typing import Any, Dict, Optional, List, Tuple

import bcrypt

from .constants import DatabaseConstants

logger = logging.getLogger(__name__)

ALLOWED_USER_ROLES = ("employee", "manager", "admin")


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
    if role not in ALLOWED_USER_ROLES:
        return False, "Role must be 'employee', 'manager', or 'admin'."

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
    """Return all users as a list of dicts (id, username, role, display_name, active, standard_rate, enhanced_rate, supervisor_rate)."""
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
                SELECT id, username, role, display_name, active,
                       {DatabaseConstants.STANDARD_RATE_COLUMN},
                       {DatabaseConstants.ENHANCED_RATE_COLUMN},
                       {DatabaseConstants.SUPERVISOR_RATE_COLUMN}
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
                "standard_rate": float(row[5]) if row[5] is not None else None,
                "enhanced_rate": float(row[6]) if row[6] is not None else None,
                "supervisor_rate": float(row[7]) if row[7] is not None else None,
            }
            for row in rows
        ]
    except Exception as e:
        logger.error("get_all_users: error: %s", e)
        return []
    finally:
        conn.close()


def get_user_pay_rates(display_name: str) -> Optional[dict]:
    """Get pay rates for a user by display_name (case-insensitive, trimmed).

    Returns dict with standard_rate, enhanced_rate, supervisor_rate (float or None),
    or None if user not found.
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    name = display_name.strip() if display_name else ""
    if not name:
        return None

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("get_user_pay_rates: DB connection failed: %s", err)
        return None

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT {DatabaseConstants.STANDARD_RATE_COLUMN},
                       {DatabaseConstants.ENHANCED_RATE_COLUMN},
                       {DatabaseConstants.SUPERVISOR_RATE_COLUMN}
                FROM {DatabaseConstants.USERS_TABLE}
                WHERE LOWER(TRIM({DatabaseConstants.DISPLAY_NAME_COLUMN})) = LOWER(%s)
                """,
                (name,),
            )
            row = cursor.fetchone()
        if row is None:
            return None
        return {
            "standard_rate": float(row[0]) if row[0] is not None else None,
            "enhanced_rate": float(row[1]) if row[1] is not None else None,
            "supervisor_rate": float(row[2]) if row[2] is not None else None,
        }
    except Exception as e:
        logger.error("get_user_pay_rates: error: %s", e)
        return None
    finally:
        conn.close()


def set_user_pay_rates(
    user_id: str,
    standard: Optional[float],
    enhanced: Optional[float],
    supervisor: Optional[float],
) -> Tuple[bool, str]:
    """Set pay rates for a user. Values can be None to clear.

    Returns (True, success_message) or (False, error_message).
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("set_user_pay_rates: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE {DatabaseConstants.USERS_TABLE}
                SET {DatabaseConstants.STANDARD_RATE_COLUMN} = %s,
                    {DatabaseConstants.ENHANCED_RATE_COLUMN} = %s,
                    {DatabaseConstants.SUPERVISOR_RATE_COLUMN} = %s
                WHERE id = %s
                """,
                (
                    Decimal(str(standard)) if standard is not None else None,
                    Decimal(str(enhanced)) if enhanced is not None else None,
                    Decimal(str(supervisor)) if supervisor is not None else None,
                    user_id,
                ),
            )
            if cursor.rowcount == 0:
                return False, "User not found."
        return True, "Pay rates updated successfully."
    except Exception as e:
        logger.error("set_user_pay_rates: error: %s", e)
        return False, f"Failed to update pay rates: {e}"
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


def update_user(
    user_id: str,
    username: str,
    display_name: str,
    role: str,
    password: Optional[str] = None,
    current_user_id: Optional[str] = None,
) -> tuple[bool, str]:
    """Update an existing user account.

    Password is optional; if blank/None, the existing password is kept.
    Returns (True, success_message) or (False, error_message).
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    if current_user_id and str(user_id) == str(current_user_id):
        return False, "You cannot edit your own account here."
    if not username.strip() or not display_name.strip():
        return False, "Username and display name are required."
    if role not in ALLOWED_USER_ROLES:
        return False, "Role must be 'employee', 'manager', or 'admin'."

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("update_user: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        query = f"""
            UPDATE {DatabaseConstants.USERS_TABLE}
            SET username = %s,
                display_name = %s,
                role = %s
        """
        params: List[object] = [username.strip(), display_name.strip(), role]

        if password:
            query += ", password_hash = %s"
            params.append(hash_password(password))

        query += " WHERE id = %s"
        params.append(user_id)

        with db.get_cursor() as cursor:
            cursor.execute(query, tuple(params))
            if cursor.rowcount == 0:
                return False, "User not found."

        return True, "User updated successfully."
    except Exception as e:
        err_str = str(e)
        if "unique" in err_str.lower() or "duplicate" in err_str.lower():
            return False, f"Username '{username.strip()}' is already taken."
        logger.error("update_user: error: %s", e)
        return False, f"Failed to update user: {err_str}"
    finally:
        conn.close()


def delete_user(user_id: str, current_user_id: Optional[str] = None) -> tuple[bool, str]:
    """Delete a user account.

    Returns (True, success_message) or (False, error_message).
    """
    from ..database.connection import DatabaseConnection, get_db_connection

    if current_user_id and str(user_id) == str(current_user_id):
        return False, "You cannot delete your own account."

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("delete_user: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                DELETE FROM {DatabaseConstants.USERS_TABLE}
                WHERE id = %s
                """,
                (user_id,),
            )
            if cursor.rowcount == 0:
                return False, "User not found."
        return True, "User deleted successfully."
    except Exception as e:
        logger.error("delete_user: error: %s", e)
        return False, f"Failed to delete user: {e}"
    finally:
        conn.close()


def is_admin_or_manager(user: Optional[Dict[str, Any]]) -> bool:
    """Return True when the session/auth user has manager-equivalent access."""
    if not isinstance(user, dict):
        return False
    return str(user.get("role") or "") in ("manager", "admin")


def count_admins() -> int:
    """Return the number of admin users."""
    from ..database.connection import DatabaseConnection, get_db_connection

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("count_admins: DB connection failed: %s", err)
        return 0

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            cursor.execute(
                f"""
                SELECT COUNT(*)
                FROM {DatabaseConstants.USERS_TABLE}
                WHERE role = 'admin'
                """
            )
            return int(cursor.fetchone()[0])
    except Exception as e:
        logger.error("count_admins: error: %s", e)
        return 0
    finally:
        conn.close()


def _get_user_for_auth(cursor, user_id: str) -> Optional[Dict[str, Any]]:
    """Load a user row needed for auth/authorization decisions."""
    cursor.execute(
        f"""
        SELECT id, username, password_hash, role, display_name, active
        FROM {DatabaseConstants.USERS_TABLE}
        WHERE id = %s
        """,
        (user_id,),
    )
    row = cursor.fetchone()
    if row is None:
        return None
    return {
        "id": str(row[0]),
        "username": row[1],
        "password_hash": row[2],
        "role": row[3],
        "display_name": row[4],
        "active": row[5],
    }


def change_password_self(user_id: str, current_password: str, new_password: str) -> Tuple[bool, str]:
    """Change the current user's password after verifying the current password."""
    from ..database.connection import DatabaseConnection, get_db_connection

    if not str(user_id).strip():
        return False, "User ID is required."
    if not current_password:
        return False, "Current password is required."
    if not new_password:
        return False, "New password is required."

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("change_password_self: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            user = _get_user_for_auth(cursor, str(user_id))
            if user is None:
                return False, "User not found."
            if not bool(user.get("active")):
                return False, "User account is inactive."
            if not verify_password(current_password, str(user["password_hash"])):
                return False, "Current password is incorrect."
            cursor.execute(
                f"""
                UPDATE {DatabaseConstants.USERS_TABLE}
                SET password_hash = %s
                WHERE id = %s
                """,
                (hash_password(new_password), str(user_id)),
            )
        return True, "Password changed successfully."
    except Exception as e:
        logger.error("change_password_self: error: %s", e)
        return False, f"Failed to change password: {e}"
    finally:
        conn.close()


def change_password_for_user(actor: Dict[str, Any], target_user_id: str, new_password: str) -> Tuple[bool, str]:
    """Reset a user's password subject to manager/admin role rules."""
    from ..database.connection import DatabaseConnection, get_db_connection

    if not isinstance(actor, dict):
        return False, "Actor context is required."
    actor_id = str(actor.get("id") or "").strip()
    actor_role = str(actor.get("role") or "").strip()
    if not actor_id:
        return False, "Actor ID is required."
    if not target_user_id:
        return False, "Target user is required."
    if not new_password:
        return False, "New password is required."
    if actor_role not in ("manager", "admin"):
        return False, "Only managers or admins can reset passwords."

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("change_password_for_user: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            target = _get_user_for_auth(cursor, str(target_user_id))
            if target is None:
                return False, "User not found."
            target_role = str(target.get("role") or "")

            if actor_role == "manager":
                if target_role != "employee":
                    return False, "Managers can only reset employee passwords."
            elif actor_role == "admin":
                pass
            else:
                return False, "Only managers or admins can reset passwords."

            cursor.execute(
                f"""
                UPDATE {DatabaseConstants.USERS_TABLE}
                SET password_hash = %s
                WHERE id = %s
                """,
                (hash_password(new_password), str(target_user_id)),
            )
        return True, "Password reset successfully."
    except Exception as e:
        logger.error("change_password_for_user: error: %s", e)
        return False, f"Failed to reset password: {e}"
    finally:
        conn.close()


def promote_to_admin(actor: Dict[str, Any], target_user_id: str) -> Tuple[bool, str]:
    """Promote a manager to admin with bootstrap rules for the first admin."""
    from ..database.connection import DatabaseConnection, get_db_connection

    if not isinstance(actor, dict):
        return False, "Actor context is required."
    actor_id = str(actor.get("id") or "").strip()
    actor_role = str(actor.get("role") or "").strip()
    target_id = str(target_user_id or "").strip()

    if not actor_id:
        return False, "Actor ID is required."
    if not target_id:
        return False, "Target user is required."

    conn, err = get_db_connection()
    if err or not conn:
        logger.error("promote_to_admin: DB connection failed: %s", err)
        return False, "Database connection failed."

    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cursor:
            target = _get_user_for_auth(cursor, target_id)
            if target is None:
                return False, "User not found."
            target_role = str(target.get("role") or "")
            if target_role == "admin":
                return False, "User is already an admin."
            if target_role != "manager":
                return False, "Only managers can be promoted to admin."

            cursor.execute(
                f"""
                SELECT COUNT(*)
                FROM {DatabaseConstants.USERS_TABLE}
                WHERE role = 'admin'
                """
            )
            admin_count = int(cursor.fetchone()[0])

            allowed = False
            if actor_role == "admin":
                allowed = True
            elif admin_count == 0 and actor_role == "manager" and actor_id == target_id:
                allowed = True
            elif admin_count == 0 and actor_role == "manager" and actor_id != target_id:
                return False, "When no admins exist, a manager may only promote themselves."

            if not allowed:
                return False, "Only admins can promote a user to admin."

            cursor.execute(
                f"""
                UPDATE {DatabaseConstants.USERS_TABLE}
                SET role = 'admin'
                WHERE id = %s
                """,
                (target_id,),
            )
            if cursor.rowcount == 0:
                return False, "User not found."
        return True, "User promoted to admin successfully."
    except Exception as e:
        logger.error("promote_to_admin: error: %s", e)
        return False, f"Failed to promote user: {e}"
    finally:
        conn.close()
