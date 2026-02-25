"""Streamlit-backed configuration readers.

This module is intentionally isolated so core config loading can import
without requiring Streamlit unless these helpers are called.
"""


def _get_supabase_value(supabase_config, key: str) -> str:
    raw = supabase_config.get(key) or supabase_config.get(key.lower())
    if raw is None:
        raise KeyError(key)
    return str(raw).strip()


def load_database_config_values() -> dict:
    """Load database config values from Streamlit secrets."""
    import streamlit as st

    supabase_config = st.secrets["SUPABASE"]
    port_val = supabase_config.get("PORT") or supabase_config.get("port")

    return {
        "host": _get_supabase_value(supabase_config, "HOST"),
        "database": _get_supabase_value(supabase_config, "DATABASE"),
        "user": _get_supabase_value(supabase_config, "USER"),
        "password": _get_supabase_value(supabase_config, "PASSWORD"),
        "port": int(port_val) if port_val is not None else 5432,
    }


def load_app_config_values() -> dict:
    """Load app config values from Streamlit secrets."""
    import streamlit as st

    supabase = st.secrets.get("SUPABASE") or {}
    manager_password = (
        st.secrets.get("MANAGER_PASSWORD")
        or supabase.get("MANAGER_PASSWORD")
        or supabase.get("manager_password")
    )
    if manager_password is not None:
        manager_password = str(manager_password).strip()

    return {
        "version": "2.0.0",
        "debug": False,
        "log_level": "INFO",
        "manager_password": manager_password,
    }
