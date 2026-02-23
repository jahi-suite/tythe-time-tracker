"""Audit logging utilities for manager-driven changes."""

import logging
from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, Optional
from uuid import UUID

from ..database.connection import DatabaseConnection, get_db_connection
from ..database.repository import TimeEntryRepository

logger = logging.getLogger(__name__)


def _json_safe(value: Any) -> Any:
    """Convert common app objects to JSON-serializable values."""
    if value is None:
        return None
    if isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    if isinstance(value, Enum):
        return value.value
    if isinstance(value, dict):
        return {str(k): _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(v) for v in value]
    return str(value)


def log_change(
    action: str,
    target_table: str,
    target_id: Optional[UUID],
    changed_by: str,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
) -> bool:
    """Write an audit log row for an add/edit/delete change."""
    if not changed_by or not changed_by.strip():
        raise ValueError("changed_by is required")

    conn, err = get_db_connection()
    if err or not conn:
        raise ValueError(err or "Could not establish database connection")

    try:
        repo = TimeEntryRepository(DatabaseConnection(conn))
        repo.insert_audit_log(
            action=action,
            target_table=target_table,
            target_id=target_id,
            changed_by=changed_by.strip(),
            old_values=_json_safe(old_values) if old_values is not None else None,
            new_values=_json_safe(new_values) if new_values is not None else None,
        )
        return True
    except Exception as e:
        logger.error("log_change failed: %s", e)
        raise
    finally:
        conn.close()
