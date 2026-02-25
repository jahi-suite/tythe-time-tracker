"""Database connection management for the time tracking application."""

import logging
from contextlib import contextmanager
from typing import Optional

import psycopg2
from psycopg2.extensions import connection
from psycopg2.pool import SimpleConnectionPool

from ..config.settings import get_database_config
from ..core.constants import DatabaseConstants, ErrorMessages, PayRateType

logger = logging.getLogger(__name__)


def get_db_connection() -> tuple[Optional[connection], Optional[str]]:
    """Create and return a database connection from config (secrets or env).

    Returns:
        (connection, None) on success, (None, error_message) on failure.
    """
    config = None
    try:
        config = get_database_config()
        port = int(config.port) if isinstance(config.port, str) else config.port
        conn = psycopg2.connect(
            host=config.host,
            database=config.database,
            user=config.user,
            password=config.password,
            port=port,
            sslmode="require",
        )
        return conn, None
    except Exception as e:
        msg = str(e)
        if config is not None:
            msg += f' (attempted user: "{config.user}")'
        logger.exception("Database connection failed while creating psycopg2 connection: %s", e)
        return None, msg


class DatabaseConnection:
    """Manages database connections and provides connection pooling."""
    
    def __init__(self, db_connection: connection) -> None:
        """Initialize the database connection manager.
        
        Args:
            db_connection: An existing database connection.
        """
        self.connection = db_connection
    
    def get_connection(self) -> connection:
        """Get the database connection.
        
        Returns:
            The database connection.
        """
        return self.connection
    
    @contextmanager
    def get_cursor(self):
        """Context manager for database operations.
        
        Yields:
            A database cursor for executing queries.
            
        Raises:
            ConnectionError: If database connection fails.
        """
        cursor = None
        try:
            cursor = self.connection.cursor()
            yield cursor
            self.connection.commit()
        except Exception as e:
            self.connection.rollback()
            logger.exception("Database operation failed; transaction rolled back: %s", e)
            raise
        finally:
            if cursor:
                cursor.close()
    
    def close(self) -> None:
        """Close the database connection."""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def test_connection(self) -> bool:
        """Test the database connection.
        
        Returns:
            True if connection is successful, False otherwise.
        """
        try:
            with self.get_cursor() as cursor:
                cursor.execute("SELECT 1")
                return True
        except Exception as e:
            logger.exception("Database connection test failed: %s", e)
            return False
    
    def initialize_tables(self) -> None:
        """Initialize database tables if they do not exist"""
        try:
            with self.get_cursor() as cursor:
                # Create users table
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

                # Create time_entries table
                cursor.execute(f"""
                    CREATE TABLE IF NOT EXISTS {DatabaseConstants.TIME_ENTRIES_TABLE} (
                        {DatabaseConstants.ID_COLUMN} UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        {DatabaseConstants.EMPLOYEE_COLUMN} TEXT NOT NULL,
                        {DatabaseConstants.CLOCK_IN_COLUMN} TIMESTAMPTZ NOT NULL,
                        {DatabaseConstants.CLOCK_OUT_COLUMN} TIMESTAMPTZ,
                        {DatabaseConstants.PAY_RATE_TYPE_COLUMN} TEXT DEFAULT '{PayRateType.STANDARD}',
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
                        ADD COLUMN {DatabaseConstants.PAY_RATE_TYPE_COLUMN} TEXT DEFAULT '{PayRateType.STANDARD}'
                    """)
                    logger.info("Database updated with pay rate functionality")
                
            logger.info("Database tables initialized successfully")
        except Exception as e:
            logger.exception("Failed to initialize database tables: %s", e)
            raise RuntimeError(ErrorMessages.DB_INIT_FAILED) from e 
