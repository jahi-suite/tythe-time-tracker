from datetime import datetime, timezone

from tythe_time_tracker.core.payroll_engine import apply_break_deduction, split_shift_by_rate


def test_split_mixed_evening_shift():
    clock_in = datetime(2025, 6, 25, 16, 0, tzinfo=timezone.utc)  # 17:00 BST
    clock_out = datetime(2025, 6, 25, 20, 0, tzinfo=timezone.utc)  # 21:00 BST

    result = split_shift_by_rate(clock_in, clock_out, is_supervisor=False)

    assert result == {"Standard": 2.0, "Enhanced": 2.0, "Supervisor": 0.0}


def test_split_overnight_shift_crossing_4am():
    clock_in = datetime(2025, 6, 25, 22, 0, tzinfo=timezone.utc)  # 23:00 BST
    clock_out = datetime(2025, 6, 26, 5, 0, tzinfo=timezone.utc)  # 06:00 BST

    result = split_shift_by_rate(clock_in, clock_out, is_supervisor=False)

    assert result == {"Standard": 2.0, "Enhanced": 5.0, "Supervisor": 0.0}


def test_split_supervisor_shift_uses_total_hours_only():
    clock_in = datetime(2025, 6, 25, 8, 0, tzinfo=timezone.utc)
    clock_out = datetime(2025, 6, 25, 16, 30, tzinfo=timezone.utc)

    result = split_shift_by_rate(clock_in, clock_out, is_supervisor=True)

    assert result == {"Standard": 0.0, "Enhanced": 0.0, "Supervisor": 8.5}


def test_split_naive_datetimes_are_treated_as_utc():
    clock_in = datetime(2025, 6, 25, 18, 0)  # treated as 18:00 UTC -> 19:00 BST
    clock_out = datetime(2025, 6, 25, 19, 0)  # treated as 19:00 UTC -> 20:00 BST

    result = split_shift_by_rate(clock_in, clock_out, is_supervisor=False)

    assert result == {"Standard": 0.0, "Enhanced": 1.0, "Supervisor": 0.0}


def test_break_deduction_applies_at_exactly_six_hours():
    result = apply_break_deduction({"Standard": 6.0, "Enhanced": 0.0, "Supervisor": 0.0})

    assert result == {"Standard": 5.67, "Enhanced": 0.0, "Supervisor": 0.0}


def test_break_deduction_tie_defaults_to_standard_bucket():
    result = apply_break_deduction({"Standard": 3.0, "Enhanced": 3.0, "Supervisor": 0.0})

    assert result == {"Standard": 2.67, "Enhanced": 3.0, "Supervisor": 0.0}


def test_split_dst_spring_forward_keeps_local_window_regression():
    clock_in = datetime(2025, 3, 30, 0, 30, tzinfo=timezone.utc)
    clock_out = datetime(2025, 3, 30, 2, 30, tzinfo=timezone.utc)

    result = split_shift_by_rate(clock_in, clock_out, is_supervisor=False)

    assert result == {"Standard": 0.0, "Enhanced": 3.0, "Supervisor": 0.0}


def test_split_dst_fall_back_keeps_local_window_regression():
    clock_in = datetime(2025, 10, 26, 0, 30, tzinfo=timezone.utc)
    clock_out = datetime(2025, 10, 26, 2, 30, tzinfo=timezone.utc)

    result = split_shift_by_rate(clock_in, clock_out, is_supervisor=False)

    assert result == {"Standard": 0.0, "Enhanced": 1.0, "Supervisor": 0.0}
