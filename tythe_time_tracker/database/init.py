"""
Database initialization module.

This module handles the setup and initialization of database tables.
"""

import logging
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

        logger.info("Database initialization completed successfully")
        return True, None

    except Exception as e:
        msg = str(e)
        logger.error(f"Database initialization failed: {e}")
        return False, msg


def ensure_database_ready() -> Tuple[bool, Optional[str]]:
    """Ensure the database is ready for use.

    Returns:
        (True, None) if ready, (False, error_message) otherwise.
    """
    return init_database() 