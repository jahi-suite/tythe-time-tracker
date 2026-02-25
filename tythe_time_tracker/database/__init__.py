"""Database layer for the time tracking application."""

from typing import Any

__all__ = ["DatabaseConnection", "TimeEntryRepository"]


def __getattr__(name: str) -> Any:
    """Lazy package exports to avoid eager psycopg2 imports on package import."""
    if name == "DatabaseConnection":
        from .connection import DatabaseConnection

        return DatabaseConnection
    if name == "TimeEntryRepository":
        from .repository import TimeEntryRepository

        return TimeEntryRepository
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
