"""
Employee interface page for clock in/out functionality.
"""

import streamlit as st
from typing import Tuple

from ...core.services import TimeTrackingService
from ...utils.time_utils import TimeUtils
from ..components.footer import render_footer


def show_employee_status(employee_name: str) -> None:
    """Show current employee status."""
    service = TimeTrackingService()

    # Check if employee has an open shift
    open_shift = service.get_open_shift(employee_name)

    if open_shift:
        st.success(f"✅ {employee_name} is currently clocked in")
        # Convert UTC time to BST for display
        bst_time = TimeUtils.convert_to_bst(open_shift.clock_in)
        st.info(f"Clocked in at: {bst_time.strftime('%Y-%m-%d %H:%M:%S')} BST")
        st.info(f"Pay Rate: {open_shift.pay_rate_type}")
    else:
        st.info(f"ℹ️ {employee_name} is not currently clocked in")


def handle_clock_in(employee_name: str, is_supervisor: bool) -> Tuple[bool, str]:
    """Handle clock in action."""
    service = TimeTrackingService()
    return service.clock_in(employee_name, is_supervisor)


def handle_clock_out(employee_name: str) -> Tuple[bool, str]:
    """Handle clock out action."""
    service = TimeTrackingService()
    return service.clock_out(employee_name)


def show() -> None:
    """Display the employee clock in/out interface."""
    st.header("Employee Clock In/Out")

    employee_name = st.session_state.current_user["display_name"]
    with st.container(border=True):
        st.write(f"Clocking in/out as: **{employee_name}**")

    col1, col2 = st.columns([1, 1])

    with col1:
        with st.container(border=True):
            st.subheader("Clock In/Out")

            # Supervisor tick box
            is_supervisor = st.checkbox("Supervisor Role", key="supervisor_checkbox")

            col_in, col_out = st.columns(2)

            with col_in:
                if st.button("Clock In", type="primary", use_container_width=True):
                    success, message = handle_clock_in(employee_name, is_supervisor)
                    if success:
                        st.success(message)
                    else:
                        st.error(message)

            with col_out:
                if st.button("Clock Out", type="secondary", use_container_width=True):
                    success, message = handle_clock_out(employee_name)
                    if success:
                        st.success(message)
                    else:
                        st.error(message)

    with col2:
        with st.container(border=True):
            st.subheader("Quick Status")
            show_employee_status(employee_name)

    render_footer()
