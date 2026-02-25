"""The Tythe Barn Time Tracker Application."""

from typing import Any

__version__ = "1.0.1"
__author__ = "The Tythe Barn Team"
__description__ = "A time tracking application for The Tythe Barn"

__all__ = [
    "__version__",
    "__author__",
    "__description__",
    "TimeEntry",
    "PayRateType", 
    "TimeTrackingService",
    "DatabaseConnection",
]


def __getattr__(name: str) -> Any:
    """Lazy exports keep package import usable without optional DB dependencies."""
    if name == "TimeEntry":
        from .core.models import TimeEntry

        return TimeEntry
    if name == "PayRateType":
        from .core.constants import PayRateType

        return PayRateType
    if name == "TimeTrackingService":
        from .core.services import TimeTrackingService

        return TimeTrackingService
    if name == "DatabaseConnection":
        from .database.connection import DatabaseConnection

        return DatabaseConnection
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
