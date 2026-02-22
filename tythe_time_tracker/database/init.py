"""
Database initialization module.

This module handles the setup and initialization of database tables.
"""

import logging
import os
from typing import Optional, Tuple

from .connection import get_db_connection
from .connection import DatabaseConnection
from ..core.constants import DatabaseConstants

logger = logging.getLogger(__name__)


def init_database() -> Tuple[bool, Optional[str]]:
    """Initialize the database tables if they don't exist.

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
                        CHECK ({DatabaseConstants.ROLE_COLUMN} IN ('employee', 'manager')),
                    {DatabaseConstants.DISPLAY_NAME_COLUMN} TEXT NOT NULL,
                    {DatabaseConstants.ACTIVE_COLUMN} BOOLEAN DEFAULT true,
                    {DatabaseConstants.CREATED_AT_COLUMN} TIMESTAMPTZ DEFAULT NOW()
                );
            """)

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

        _seed_manager_if_empty(conn)

        logger.info("Database initialization completed successfully")
        return True, None

    except Exception as e:
        msg = str(e)
        logger.error(f"Database initialization failed: {e}")
        return False, msg


def _get_seed_credentials() -> Tuple[str, str]:
    """Get seed manager username and password from env or Streamlit secrets."""
    username = os.environ.get("SEED_MANAGER_USERNAME", "").strip()
    password = os.environ.get("SEED_MANAGER_PASSWORD", "").strip()
    if username and password:
        return username, password
    try:
        import streamlit as st
        secrets = st.secrets if hasattr(st, "secrets") else {}
        # Top-level or under SUPABASE
        supabase = secrets.get("SUPABASE") or {}
        username = (secrets.get("SEED_MANAGER_USERNAME") or supabase.get("SEED_MANAGER_USERNAME") or "").strip()
        password = (secrets.get("SEED_MANAGER_PASSWORD") or supabase.get("SEED_MANAGER_PASSWORD") or "").strip()
        if isinstance(username, str) and isinstance(password, str):
            return username, password
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