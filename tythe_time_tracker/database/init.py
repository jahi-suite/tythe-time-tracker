"""
Database initialization module.

This module handles the setup and initialization of database tables.
"""

import logging
import os
import importlib
from typing import Optional, Tuple

from .connection import get_db_connection
from .connection import DatabaseConnection
from ..core.constants import DatabaseConstants

logger = logging.getLogger(__name__)


def _load_ui_secrets_helper():
    """Load UI secrets helper lazily for optional seed credential lookup."""
    return importlib.import_module("tythe_time_tracker.ui.secrets_provider")


def init_database() -> Tuple[bool, Optional[str]]:
    """Initialize the database tables if they do not exist

    Returns:
        (True, None) if successful, (False, error_message) otherwise.
    """
    try:
        conn, conn_error = get_db_connection()
        if conn_error or not conn:
            msg = conn_error or "Could not connect to the database. Check host, port, user, and password."
            logger.error(msg)
            return False, msg

        db = DatabaseConnection(conn)

        with db.get_cursor() as cursor:
            # Create users table if it doesn't exist
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS {DatabaseConstants.USERS_TABLE} (
                    {DatabaseConstants.ID_COLUMN} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    {DatabaseConstants.USERNAME_COLUMN} TEXT UNIQUE NOT NULL,
                    {DatabaseConstants.PASSWORD_HASH_COLUMN} TEXT NOT NULL,
                    {DatabaseConstants.ROLE_COLUMN} TEXT NOT NULL DEFAULT 'employee'
                        CHECK ({DatabaseConstants.ROLE_COLUMN} IN ('employee', 'manager', 'admin')),
                    {DatabaseConstants.DISPLAY_NAME_COLUMN} TEXT NOT NULL,
                    {DatabaseConstants.ACTIVE_COLUMN} BOOLEAN DEFAULT true,
                    {DatabaseConstants.CREATED_AT_COLUMN} TIMESTAMPTZ DEFAULT NOW()
                );
            """)

            # Ensure legacy users.role CHECK constraint allows 'admin'
            cursor.execute(
                """
                SELECT c.conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_class t ON t.oid = c.conrelid
                WHERE t.relname = %s
                  AND c.contype = 'c'
                """,
                (DatabaseConstants.USERS_TABLE,),
            )
            role_check_found = False
            for constraint_name, constraint_def in cursor.fetchall():
                definition = str(constraint_def or "")
                if DatabaseConstants.ROLE_COLUMN not in definition:
                    continue
                role_check_found = True
                if "'admin'" in definition:
                    break
                safe_name = str(constraint_name).replace('"', '""')
                cursor.execute(
                    f'ALTER TABLE {DatabaseConstants.USERS_TABLE} DROP CONSTRAINT "{safe_name}"'
                )
                cursor.execute(
                    f"""
                    ALTER TABLE {DatabaseConstants.USERS_TABLE}
                    ADD CONSTRAINT {DatabaseConstants.USERS_TABLE}_{DatabaseConstants.ROLE_COLUMN}_check
                    CHECK ({DatabaseConstants.ROLE_COLUMN} IN ('employee', 'manager', 'admin'))
                    """
                )
                logger.info("Database updated users.role CHECK to allow admin")
                break
            if not role_check_found:
                cursor.execute(
                    f"""
                    ALTER TABLE {DatabaseConstants.USERS_TABLE}
                    ADD CONSTRAINT {DatabaseConstants.USERS_TABLE}_{DatabaseConstants.ROLE_COLUMN}_check
                    CHECK ({DatabaseConstants.ROLE_COLUMN} IN ('employee', 'manager', 'admin'))
                    """
                )
                logger.info("Database added users.role CHECK constraint with admin support")

            # Create time_entries table if it doesn't exist
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS {DatabaseConstants.TIME_ENTRIES_TABLE} (
                    {DatabaseConstants.ID_COLUMN} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    {DatabaseConstants.EMPLOYEE_COLUMN} TEXT NOT NULL,
                    {DatabaseConstants.CLOCK_IN_COLUMN} TIMESTAMPTZ NOT NULL,
                    {DatabaseConstants.CLOCK_OUT_COLUMN} TIMESTAMPTZ,
                    {DatabaseConstants.PAY_RATE_TYPE_COLUMN} TEXT DEFAULT '{DatabaseConstants.DEFAULT_PAY_RATE}',
                    {DatabaseConstants.CREATED_AT_COLUMN} TIMESTAMPTZ DEFAULT NOW()
                );
            """)

            # Create audit_log table if it doesn't exist
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS {DatabaseConstants.AUDIT_LOG_TABLE} (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    action TEXT NOT NULL CHECK (action IN ('add', 'edit', 'delete')),
                    target_table TEXT NOT NULL,
                    target_id UUID,
                    changed_by TEXT NOT NULL,
                    old_values JSONB,
                    new_values JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
            """)

            # Check if pay_rate_type column exists, add if not
            cursor.execute(f"""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = '{DatabaseConstants.TIME_ENTRIES_TABLE}'
                AND column_name = '{DatabaseConstants.PAY_RATE_TYPE_COLUMN}'
            """)

            if not cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE {DatabaseConstants.TIME_ENTRIES_TABLE}
                    ADD COLUMN {DatabaseConstants.PAY_RATE_TYPE_COLUMN} TEXT DEFAULT '{DatabaseConstants.DEFAULT_PAY_RATE}'
                """)
                logger.info("Database updated with pay rate functionality")

            # Add user_id linkage to time_entries (best-effort backfill for legacy rows)
            cursor.execute(f"""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = '{DatabaseConstants.TIME_ENTRIES_TABLE}'
                AND column_name = '{DatabaseConstants.USER_ID_COLUMN}'
            """)
            if not cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE {DatabaseConstants.TIME_ENTRIES_TABLE}
                    ADD COLUMN {DatabaseConstants.USER_ID_COLUMN} UUID NULL
                """)
                logger.info("Database added time_entries.user_id column")

            cursor.execute(f"""
                CREATE INDEX IF NOT EXISTS idx_{DatabaseConstants.TIME_ENTRIES_TABLE}_{DatabaseConstants.USER_ID_COLUMN}
                ON {DatabaseConstants.TIME_ENTRIES_TABLE} ({DatabaseConstants.USER_ID_COLUMN})
            """)

            cursor.execute(
                """
                SELECT 1
                FROM pg_constraint c
                JOIN pg_class t ON t.oid = c.conrelid
                WHERE t.relname = %s
                  AND c.contype = 'f'
                  AND c.conname = %s
                """,
                (
                    DatabaseConstants.TIME_ENTRIES_TABLE,
                    f"{DatabaseConstants.TIME_ENTRIES_TABLE}_{DatabaseConstants.USER_ID_COLUMN}_fkey",
                ),
            )
            if not cursor.fetchone():
                cursor.execute(f"""
                    ALTER TABLE {DatabaseConstants.TIME_ENTRIES_TABLE}
                    ADD CONSTRAINT {DatabaseConstants.TIME_ENTRIES_TABLE}_{DatabaseConstants.USER_ID_COLUMN}_fkey
                    FOREIGN KEY ({DatabaseConstants.USER_ID_COLUMN})
                    REFERENCES {DatabaseConstants.USERS_TABLE} ({DatabaseConstants.ID_COLUMN})
                    ON DELETE SET NULL
                """)
                logger.info("Database added time_entries.user_id foreign key")

            cursor.execute(f"""
                WITH unique_display_users AS (
                    SELECT LOWER(TRIM({DatabaseConstants.DISPLAY_NAME_COLUMN})) AS display_key,
                           (array_agg({DatabaseConstants.ID_COLUMN}))[1] AS user_id
                    FROM {DatabaseConstants.USERS_TABLE}
                    GROUP BY LOWER(TRIM({DatabaseConstants.DISPLAY_NAME_COLUMN}))
                    HAVING COUNT(*) = 1
                )
                UPDATE {DatabaseConstants.TIME_ENTRIES_TABLE} te
                SET {DatabaseConstants.USER_ID_COLUMN} = u.user_id
                FROM unique_display_users u
                WHERE te.{DatabaseConstants.USER_ID_COLUMN} IS NULL
                  AND LOWER(TRIM(te.{DatabaseConstants.EMPLOYEE_COLUMN})) = u.display_key
            """)

            # Add pay rate columns to users table if they don't exist
            for col in (
                DatabaseConstants.STANDARD_RATE_COLUMN,
                DatabaseConstants.ENHANCED_RATE_COLUMN,
                DatabaseConstants.SUPERVISOR_RATE_COLUMN,
            ):
                cursor.execute(f"""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name = '{DatabaseConstants.USERS_TABLE}'
                    AND column_name = '{col}'
                """)
                if not cursor.fetchone():
                    cursor.execute(f"""
                        ALTER TABLE {DatabaseConstants.USERS_TABLE}
                        ADD COLUMN {col} DECIMAL(10,2) NULL
                    """)
                    logger.info("Database updated with %s column", col)

        _seed_manager_if_empty(conn)

        logger.info("Database initialization completed successfully")
        return True, None

    except Exception as e:
        msg = str(e)
        logger.error(f"Database initialization failed: {e}")
        return False, msg


def _get_seed_credentials() -> Tuple[str, str]:
    """Get seed manager username and password from env or Streamlit secrets."""
    username = (os.environ.get("SEED_MANAGER_USERNAME") or "").strip()
    password = (os.environ.get("SEED_MANAGER_PASSWORD") or "").strip()
    if username and password:
        return username, password
    try:
        helper = _load_ui_secrets_helper()
        return helper.load_seed_manager_credentials()
    except Exception:
        pass
    return "", ""


def _seed_manager_if_empty(conn) -> None:
    """Insert a seed manager if users table is empty and env vars are set.

    Reads SEED_MANAGER_USERNAME and SEED_MANAGER_PASSWORD from environment
    or Streamlit secrets (top-level or under [SUPABASE]).
    Skips silently if either var is missing or the table already has rows.
    """
    seed_username, seed_password = _get_seed_credentials()

    if not seed_username or not seed_password:
        logger.debug("Seed manager env vars not set; skipping seed.")
        return

    from ..core.auth import hash_password

    db = DatabaseConnection(conn)
    with db.get_cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) FROM {DatabaseConstants.USERS_TABLE}")
        count = cursor.fetchone()[0]

        if count > 0:
            logger.debug("Users table non-empty; skipping seed manager.")
            return

        password_hash = hash_password(seed_password)
        cursor.execute(
            f"""
            INSERT INTO {DatabaseConstants.USERS_TABLE}
                ({DatabaseConstants.USERNAME_COLUMN},
                 {DatabaseConstants.PASSWORD_HASH_COLUMN},
                 {DatabaseConstants.ROLE_COLUMN},
                 {DatabaseConstants.DISPLAY_NAME_COLUMN})
            VALUES (%s, %s, 'manager', 'Admin')
            """,
            (seed_username, password_hash),
        )
        logger.info("Seed manager account created: %s", seed_username)


def ensure_database_ready() -> Tuple[bool, Optional[str]]:
    """Ensure the database is ready for use.

    Returns:
        (True, None) if ready, (False, error_message) otherwise.
    """
    return init_database()


def run_seed_if_empty() -> bool:
    """If users table is empty and seed credentials exist, create the seed manager now.

    Call this from the login page so the first user is created when secrets are
    available (e.g. on Streamlit Cloud where init might run before secrets are loaded).
    Returns True if a user was created (caller may want to rerun the UI).
    """
    ok, _ = bootstrap_seed_manager()
    return ok


def is_users_table_empty() -> bool:
    """Return True if the users table has no rows."""
    conn, err = get_db_connection()
    if err or not conn:
        return True  # Assume empty if we can't connect
    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {DatabaseConstants.USERS_TABLE}")
            return cur.fetchone()[0] == 0
    except Exception:
        return True
    finally:
        conn.close()


def create_first_manager_from_ui(username: str, password: str, display_name: str) -> Tuple[bool, str]:
    """Create the first manager account when users table is empty. No secrets required.

    Returns (True, success_message) or (False, error_message).
    """
    from ..core.auth import create_user

    if not is_users_table_empty():
        return False, "An admin account already exists. Please log in."
    return create_user(username, password, display_name, "manager")


def bootstrap_seed_manager() -> Tuple[bool, str]:
    """Create seed manager if table is empty. Returns (success, message)."""
    conn, err = get_db_connection()
    if err or not conn:
        return False, f"Database: {err or 'no connection'}"
    try:
        db = DatabaseConnection(conn)
        with db.get_cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {DatabaseConstants.USERS_TABLE}")
            if cur.fetchone()[0] > 0:
                return False, "Users already exist"
        seed_username, seed_password = _get_seed_credentials()
        if not seed_username or not seed_password:
            return False, "Secrets not found: set SEED_MANAGER_USERNAME and SEED_MANAGER_PASSWORD in Streamlit secrets under [SUPABASE]"
        _seed_manager_if_empty(conn)
        with db.get_cursor() as cur:
            cur.execute(f"SELECT COUNT(*) FROM {DatabaseConstants.USERS_TABLE}")
            if cur.fetchone()[0] > 0:
                return True, f"Admin user '{seed_username}' created. Log in with that username and your SEED_MANAGER_PASSWORD."
        return False, "Insert did not create a row"
    except Exception as e:
        return False, str(e)
    finally:
        conn.close()
