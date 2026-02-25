"""UI-only secrets readers backed by Streamlit."""


def _get_supabase_value(supabase_config, key: str) -> str:
    raw = supabase_config.get(key) or supabase_config.get(key.lower())
    if raw is None:
        raise KeyError(key)
    return str(raw).strip()


def load_database_config_values() -> dict:
    """Load database config values from UI secrets."""
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
    """Load app config values from UI secrets."""
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


def load_seed_manager_credentials() -> tuple[str, str]:
    """Load seed manager credentials from UI secrets if present."""
    import streamlit as st

    secrets = getattr(st, "secrets", None)
    if secrets is None:
        return "", ""

    for sec in ("SUPABASE", "supabase"):
        try:
            sub = secrets[sec]
            username = sub.get("SEED_MANAGER_USERNAME") or sub.get("seed_manager_username") or ""
            password = sub.get("SEED_MANAGER_PASSWORD") or sub.get("seed_manager_password") or ""
            username, password = str(username).strip(), str(password).strip()
            if username and password:
                return username, password
        except (KeyError, TypeError, AttributeError):
            continue

    return "", ""
