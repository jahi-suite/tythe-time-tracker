"""Core business logic and models for the time tracking application."""

from typing import Any

__all__ = ["PayRateType", "TimeConstants", "TimeEntry", "TimeTrackingService"]


def __getattr__(name: str) -> Any:
    """Lazy package exports to avoid importing service/DB dependencies on package import."""
    if name == "TimeEntry":
        from .models import TimeEntry

        return TimeEntry
    if name == "PayRateType":
        from .constants import PayRateType

        return PayRateType
    if name == "TimeConstants":
        from .constants import TimeConstants

        return TimeConstants
    if name == "TimeTrackingService":
        from .services import TimeTrackingService

        return TimeTrackingService
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
