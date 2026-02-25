"""Pure payroll split logic for Kari Time exports and summaries."""

from __future__ import annotations

from datetime import datetime, time as dtime, timedelta
from typing import Mapping
from zoneinfo import ZoneInfo

RATE_KEYS = ("Standard", "Enhanced", "Supervisor")
BREAK_HOURS = 20 / 60
UK_TZ = ZoneInfo("Europe/London")


def split_shift_by_rate(
    clock_in: datetime | None,
    clock_out: datetime | None,
    is_supervisor: bool,
) -> dict[str, float]:
    """Split a shift into standard/enhanced/supervisor hours.

    Inputs are treated as UTC timestamps and converted to Europe/London local time
    (GMT/BST) for rate-boundary calculations.
    """
    if not clock_in or not clock_out:
        return _zero_split()

    if is_supervisor:
        total_hours = (clock_out - clock_in).total_seconds() / 3600
        if total_hours <= 0:
            return _zero_split()
        return {
            "Standard": 0.0,
            "Enhanced": 0.0,
            "Supervisor": round(total_hours, 2),
        }

    local_in = _to_local_naive(clock_in)
    local_out = _to_local_naive(clock_out)
    if local_out <= local_in:
        return _zero_split()

    enhanced_start, enhanced_end = _enhanced_window_for_shift_start(local_in)

    overlap_start = max(local_in, enhanced_start)
    overlap_end = min(local_out, enhanced_end)
    enhanced_hours = 0.0
    if overlap_start < overlap_end:
        enhanced_hours = (overlap_end - overlap_start).total_seconds() / 3600

    total_hours = (local_out - local_in).total_seconds() / 3600
    standard_hours = total_hours - enhanced_hours

    return {
        "Standard": round(standard_hours, 2),
        "Enhanced": round(enhanced_hours, 2),
        "Supervisor": 0.0,
    }


def apply_break_deduction(split: Mapping[str, float | int | None]) -> dict[str, float]:
    """Apply the 20-minute unpaid break to the majority bucket for 6h+ shifts."""
    adjusted = {
        "Standard": round(float(split.get("Standard", 0) or 0), 2),
        "Enhanced": round(float(split.get("Enhanced", 0) or 0), 2),
        "Supervisor": round(float(split.get("Supervisor", 0) or 0), 2),
    }

    total_hours = adjusted["Standard"] + adjusted["Enhanced"] + adjusted["Supervisor"]
    if total_hours < 6:
        return adjusted

    majority = "Standard"
    max_hours = adjusted["Standard"]
    for key in ("Enhanced", "Supervisor"):
        if adjusted[key] > max_hours:
            majority = key
            max_hours = adjusted[key]

    adjusted[majority] -= min(adjusted[majority], BREAK_HOURS)

    for key in RATE_KEYS:
        adjusted[key] = round(adjusted[key], 2)
    return adjusted


def _to_local_naive(value: datetime) -> datetime:
    if value.tzinfo is None:
        value = value.replace(tzinfo=ZoneInfo("UTC"))
    return value.astimezone(UK_TZ).replace(tzinfo=None)


def _enhanced_window_for_shift_start(local_start: datetime) -> tuple[datetime, datetime]:
    if local_start.hour < 4:
        return (
            datetime.combine(local_start.date() - timedelta(days=1), dtime(19, 0)),
            datetime.combine(local_start.date(), dtime(4, 0)),
        )

    return (
        datetime.combine(local_start.date(), dtime(19, 0)),
        datetime.combine(local_start.date() + timedelta(days=1), dtime(4, 0)),
    )


def _zero_split() -> dict[str, float]:
    return {"Standard": 0.0, "Enhanced": 0.0, "Supervisor": 0.0}
