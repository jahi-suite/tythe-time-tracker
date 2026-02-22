"""Application configuration settings."""

import os
from dataclasses import dataclass
from typing import Optional

from dotenv import load_dotenv

# Load environment variables
load_dotenv()


@dataclass(frozen=True)
class DatabaseConfig:
    """Database configuration settings."""
    
    host: str
    database: str
    user: str
    password: str
    port: int
    
    @classmethod
    def from_env(cls) -> "DatabaseConfig":
        """Create database config from environment variables.
        
        Returns:
            DatabaseConfig instance.
            
        Raises:
            ValueError: If required environment variables are missing.
        """
        host = os.getenv("SUPABASE_HOST")
        database = os.getenv("SUPABASE_DATABASE")
        user = os.getenv("SUPABASE_USER")
        password = os.getenv("SUPABASE_PASSWORD")
        port_str = os.getenv("SUPABASE_PORT", "5432")
        
        if not all([host, database, user, password]):
            raise ValueError("Missing required database environment variables")
        
        try:
            port = int(port_str)
        except ValueError:
            raise ValueError(f"Invalid port number: {port_str}")
        
        return cls(
            host=host,
            database=database,
            user=user,
            password=password,
            port=port
        )
    
    @classmethod
    def from_streamlit_secrets(cls) -> "DatabaseConfig":
        """Create database config from Streamlit secrets.
        
        Returns:
            DatabaseConfig instance.
            
        Raises:
            ValueError: If required secrets are missing.
        """
        import streamlit as st
        
        def _get(key: str) -> str:
            raw = supabase_config.get(key) or supabase_config.get(key.lower())
            if raw is None:
                raise KeyError(key)
            return str(raw).strip()

        try:
            supabase_config = st.secrets["SUPABASE"]
            host = _get("HOST")
            database = _get("DATABASE")
            user = _get("USER")
            password = _get("PASSWORD")
            port_val = supabase_config.get("PORT") or supabase_config.get("port")
            port = int(port_val) if port_val is not None else 5432

            return cls(
                host=host,
                database=database,
                user=user,
                password=password,
                port=port
            )
        except (KeyError, ValueError) as e:
            raise ValueError(f"Invalid Streamlit secrets configuration: {e}")
    
    def to_dict(self) -> dict:
        """Convert config to dictionary.
        
        Returns:
            Dictionary representation of the config.
        """
        return {
            "HOST": self.host,
            "DATABASE": self.database,
            "USER": self.user,
            "PASSWORD": self.password,
            "PORT": self.port
        }


@dataclass(frozen=True)
class AppConfig:
    """Application configuration settings."""
    
    version: str
    debug: bool
    log_level: str
    manager_password: Optional[str]
    
    @classmethod
    def from_env(cls) -> "AppConfig":
        """Create app config from environment variables.
        
        Returns:
            AppConfig instance.
        """
        version = os.getenv("APP_VERSION", "2.0.0")
        debug = os.getenv("DEBUG", "false").lower() == "true"
        log_level = os.getenv("LOG_LEVEL", "INFO")
        manager_password = os.getenv("MANAGER_PASSWORD")
        
        return cls(
            version=version,
            debug=debug,
            log_level=log_level,
            manager_password=manager_password
        )
    
    @classmethod
    def from_streamlit_secrets(cls) -> "AppConfig":
        """Create app config from Streamlit secrets.
        
        Returns:
            AppConfig instance.
        """
        import streamlit as st
        
        try:
            version = "2.0.0"  # Default version
            debug = False  # Default debug setting
            log_level = "INFO"  # Default log level
            # MANAGER_PASSWORD can be top-level or under SUPABASE (e.g. in same Secrets block)
            supabase = st.secrets.get("SUPABASE") or {}
            manager_password = (
                st.secrets.get("MANAGER_PASSWORD")
                or supabase.get("MANAGER_PASSWORD")
                or supabase.get("manager_password")
            )
            if manager_password is not None:
                manager_password = str(manager_password).strip()

            return cls(
                version=version,
                debug=debug,
                log_level=log_level,
                manager_password=manager_password
            )
        except Exception as e:
            raise ValueError(f"Invalid Streamlit secrets configuration: {e}")


def get_database_config() -> DatabaseConfig:
    """Get database configuration.
    
    Returns:
        DatabaseConfig instance.
        
    Raises:
        ValueError: If configuration cannot be loaded.
    """
    try:
        # Try Streamlit secrets first
        return DatabaseConfig.from_streamlit_secrets()
    except Exception:
        # Fall back to environment variables
        return DatabaseConfig.from_env()


def get_app_config() -> AppConfig:
    """Get application configuration.
    
    Returns:
        AppConfig instance.
        
    Raises:
        ValueError: If configuration cannot be loaded.
    """
    try:
        # Try Streamlit secrets first
        return AppConfig.from_streamlit_secrets()
    except Exception:
        # Fall back to environment variables
        return AppConfig.from_env() 