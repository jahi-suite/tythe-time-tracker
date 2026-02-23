"""
Manager dashboard page for administrative functions.
"""

import streamlit as st
import os
from datetime import datetime, date, time
from typing import Any, Dict, List, Optional, Tuple
from collections import defaultdict

from ...core.services import TimeTrackingService
from ...core.models import TimeEntry
from ...core.auth import create_user, get_all_users, set_user_active
from ...core.constants import DatabaseConstants
from ...database.connection import DatabaseConnection, get_db_connection
from ...database.repository import TimeEntryRepository
from ...utils.time_utils import TimeUtils
from ..components.footer import render_footer
from export_functions import (
    export_to_excel, export_to_pdf, split_shift_by_rate
)


def check_manager_role() -> bool:
    """Return True if the current user has the manager role, else show an error."""
    user = st.session_state.get("current_user")
    if not user or user.get("role") != "manager":
        st.error("⛔ Access denied. Manager role required.")
        return False
    return True


def show_manager_header() -> None:
    """Show manager dashboard header."""
    user = st.session_state.current_user
    st.header("Manager Dashboard")
    with st.container(border=True):
        st.success(f"✅ Logged in as {user['display_name']}")


def show_all_entries_tab() -> None:
    """Show the 'View All Entries' tab."""
    with st.container(border=True):
        st.subheader("All Time Entries (Grouped)")

        service = TimeTrackingService()
        entries = service.get_all_timesheets()

        if not entries:
            st.info("No time entries found")
            return

        st.markdown("### Quick Export")
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Export All to Excel", key="quick_excel_grouped"):
                filename = f"all_timesheets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
                export_to_excel(entries, filename, None, None)
                with open(filename, "rb") as f:
                    st.download_button(
                        label="Download Excel File",
                        data=f.read(),
                        file_name=filename,
                        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    )
                os.remove(filename)
        with col2:
            if st.button("Export All to PDF", key="quick_pdf_grouped"):
                filename = f"all_timesheets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                export_to_pdf(entries, filename)
                with open(filename, "rb") as f:
                    st.download_button(
                        label="Download PDF File",
                        data=f.read(),
                        file_name=filename,
                        mime="application/pdf"
                    )
                os.remove(filename)

    # Group by staff
    staff_shifts = defaultdict(list)
    for entry in entries:
        staff_shifts[entry.employee.strip()].append(entry)
    
    for staff, shifts in sorted(staff_shifts.items()):
        with st.expander(f"{staff}", expanded=False):
            # Staff summary
            total_std = total_enh = total_sup = total_hours = 0
            for entry in shifts:
                is_supervisor = (entry.pay_rate_type == 'Supervisor')
                split = split_shift_by_rate(entry.clock_in, entry.clock_out, is_supervisor)
                total_std += split['Standard']
                total_enh += split['Enhanced']
                total_sup += split['Supervisor']
                total_hours += sum(split.values())
            
            st.markdown(f"**Total:** {total_hours:.2f}h  ")
            st.markdown(f"Standard: {total_std:.2f}h | Enhanced: {total_enh:.2f}h | Supervisor: {total_sup:.2f}h")
            st.markdown("---")
            
            # List shifts
            for entry in sorted(shifts, key=lambda e: e.clock_in, reverse=True):
                is_supervisor = (entry.pay_rate_type == 'Supervisor')
                split = split_shift_by_rate(entry.clock_in, entry.clock_out, is_supervisor)
                
                if is_supervisor:
                    rate_display = f"Supervisor ({split['Supervisor']}h)"
                elif split['Standard'] > 0 and split['Enhanced'] > 0:
                    rate_display = f"Mixed: {split['Standard']}h Standard, {split['Enhanced']}h Enhanced"
                elif split['Enhanced'] > 0:
                    rate_display = f"Enhanced ({split['Enhanced']}h)"
                else:
                    rate_display = f"Standard ({split['Standard']}h)"
                
                col1, col2, col3, col4, col5 = st.columns([2, 2, 2, 3, 1])
                with col1:
                    # Convert UTC to BST for display
                    bst_clock_in = TimeUtils.convert_to_bst(entry.clock_in)
                    st.markdown(bst_clock_in.strftime('%Y-%m-%d'))
                with col2:
                    st.markdown(bst_clock_in.strftime('%H:%M'))
                with col3:
                    if entry.clock_out:
                        bst_clock_out = TimeUtils.convert_to_bst(entry.clock_out)
                        st.markdown(bst_clock_out.strftime('%H:%M'))
                    else:
                        st.markdown('In Progress')
                with col4:
                    st.markdown(rate_display)
                with col5:
                    if st.button("Edit", key=f"edit_{entry.id}"):
                        st.session_state['edit_entry_id'] = str(entry.id)
                        st.session_state['__active_tab__'] = 2
                    if st.button("Delete", key=f"delete_{entry.id}"):
                        st.session_state['delete_entry_id'] = str(entry.id)
                        st.session_state['__active_tab__'] = 3


def show_add_shift_tab() -> None:
    """Show the 'Add Shift' tab."""
    with st.container(border=True):
        st.subheader("Add Shift Manually")

        col1, col2 = st.columns(2)

        with col1:
            employee_name = st.text_input("Employee Name:", key="add_employee")
            clock_in_date = st.date_input("Clock-In Date:", key="add_clock_in_date")
            clock_in_time = st.time_input("Clock-In Time:", key="add_clock_in_time")
            is_supervisor = st.checkbox("Supervisor Role", key="add_supervisor")

        with col2:
            clock_out_date = st.date_input("Clock-Out Date (optional):", key="add_clock_out_date")
            clock_out_time = st.time_input("Clock-Out Time (optional):", key="add_clock_out_time")

            pay_rate_override = st.selectbox(
                "Pay Rate Override (optional):",
                ["Auto-calculate", "Standard", "Enhanced", "Supervisor"],
                key="add_pay_rate_override"
            )

            if pay_rate_override == "Auto-calculate":
                pay_rate_override = None

    if st.button("Add Shift", type="primary"):
        if employee_name.strip():
            service = TimeTrackingService()
            success, message = service.add_shift_manually(
                employee_name.strip(),
                clock_in_date,
                clock_in_time,
                clock_out_date if clock_out_date else None,
                clock_out_time if clock_out_time else None,
                is_supervisor,
                pay_rate_override
            )
            if success:
                st.success(message)
                st.rerun()
            else:
                st.error(message)
        else:
            st.warning("Please enter an employee name")


def show_edit_shift_tab() -> None:
    """Show the 'Edit Shift' tab."""
    with st.container(border=True):
        st.subheader("Edit Shift")
        st.info("💡 **Instructions:** Copy an Entry ID from the 'View All Entries' tab above, then paste it here to edit that shift.")
        entry_id = st.text_input("Enter Entry ID to edit:", key="edit_entry_id", placeholder="Paste Entry ID here...")
    
    if not entry_id:
        st.warning("Please enter an Entry ID to edit a shift")
        return
    
    service = TimeTrackingService()
    shift = service.get_shift_by_id(entry_id)
    
    if not shift:
        st.error("❌ Shift not found. Please check the Entry ID.")
        st.info("💡 Make sure you copied the Entry ID correctly from the 'View All Entries' tab.")
        return
    
    with st.container(border=True):
        st.success(f"✅ Found shift for {shift.employee}")
    
    # Debug info (can be removed later)
    with st.expander("Debug Info", expanded=False):
        st.write(f"Entry ID: {shift.id}")
        st.write(f"Employee: {shift.employee}")
        st.write(f"Clock In: {shift.clock_in}")
        st.write(f"Clock Out: {shift.clock_out}")
        st.write(f"Pay Rate: {shift.pay_rate_type}")
    
    with st.container(border=True):
        st.subheader("Edit Shift Details")

        col1, col2 = st.columns(2)

        # Show times in UK local (GMT/BST) so edit form matches what managers expect
        clock_in_uk = TimeUtils.convert_to_bst(shift.clock_in)
        with col1:
            employee_name = st.text_input("Employee Name:", value=shift.employee, key="edit_employee")
            clock_in_date = st.date_input("Clock-In Date:", value=clock_in_uk.date(), key="edit_clock_in_date")
            clock_in_time = st.time_input("Clock-In Time:", value=clock_in_uk.time(), key="edit_clock_in_time")
            is_supervisor = st.checkbox("Supervisor Role", value=shift.pay_rate_type == "Supervisor", key="edit_supervisor")

        with col2:
            # Handle None clock_out values properly; show in UK local time
            if shift.clock_out:
                clock_out_uk = TimeUtils.convert_to_bst(shift.clock_out)
                default_clock_out_date = clock_out_uk.date()
                default_clock_out_time = clock_out_uk.time()
            else:
                default_clock_out_date = None
                default_clock_out_time = None

            clock_out_date = st.date_input("Clock-Out Date (optional):", value=default_clock_out_date, key="edit_clock_out_date")
            clock_out_time = st.time_input("Clock-Out Time (optional):", value=default_clock_out_time, key="edit_clock_out_time")

            pay_rate_override = st.selectbox(
                "Pay Rate Override:",
                ["Auto-calculate", "Standard", "Enhanced", "Supervisor"],
                index=["Auto-calculate", "Standard", "Enhanced", "Supervisor"].index(shift.pay_rate_type) if shift.pay_rate_type in ["Standard", "Enhanced", "Supervisor"] else 0,
                key="edit_pay_rate_override"
            )

            if pay_rate_override == "Auto-calculate":
                pay_rate_override = None
    
    if st.button("Update Shift", type="primary"):
        if employee_name.strip():
            success, message = service.edit_shift(
                entry_id,
                employee_name.strip(),
                clock_in_date,
                clock_in_time,
                clock_out_date if clock_out_date else None,
                clock_out_time if clock_out_time else None,
                is_supervisor,
                pay_rate_override
            )
            if success:
                st.success(message)
                st.rerun()
            else:
                st.error(message)
        else:
            st.warning("Please enter an employee name")


def show_delete_entry_tab() -> None:
    """Show the 'Delete Entry' tab."""
    with st.container(border=True):
        st.subheader("Delete Entry")
        entry_to_delete = st.text_input("Enter Entry ID to delete:", key="delete_entry_id")
    if st.button("Delete Entry", type="secondary"):
        if entry_to_delete:
            service = TimeTrackingService()
            success, message = service.delete_entry(entry_to_delete)
            if success:
                st.success(message)
                st.rerun()
            else:
                st.error(message)
        else:
            st.warning("Please enter an Entry ID")


def show_manage_users_tab() -> None:
    """Show the 'Manage Users' tab for creating and toggling user accounts."""
    with st.container(border=True):
        st.subheader("Create New User")

        with st.form("create_user_form"):
            col1, col2 = st.columns(2)
            with col1:
                new_username = st.text_input("Username", key="new_username")
                new_display_name = st.text_input("Display Name", key="new_display_name")
            with col2:
                new_password = st.text_input("Password", type="password", key="new_password")
                new_role = st.selectbox("Role", ["employee", "manager"], key="new_role")
            submitted = st.form_submit_button("Create User", type="primary")

    if submitted:
        success, message = create_user(new_username, new_password, new_display_name, new_role)
        if success:
            st.success(message)
            st.rerun()
        else:
            st.error(message)

    with st.container(border=True):
        st.subheader("All Users")

        users = get_all_users()
        if not users:
            st.info("No users found.")
            return

        current_user_id = st.session_state.current_user.get("id")
        for user in users:
            col1, col2, col3, col4 = st.columns([2, 2, 1, 1])
            with col1:
                st.markdown(f"**{user['display_name']}** (`{user['username']}`)")
            with col2:
                st.markdown(f"Role: {user['role']}")
            with col3:
                status_label = "Active" if user["active"] else "Inactive"
                st.markdown(status_label)
            with col4:
                if user["id"] == current_user_id:
                    st.markdown("*(you)*")
                elif user["active"]:
                    if st.button("Deactivate", key=f"deactivate_{user['id']}"):
                        ok, msg = set_user_active(user["id"], False)
                        if ok:
                            st.success(msg)
                            st.rerun()
                        else:
                            st.error(msg)
                else:
                    if st.button("Activate", key=f"activate_{user['id']}"):
                        ok, msg = set_user_active(user["id"], True)
                        if ok:
                            st.success(msg)
                            st.rerun()
                        else:
                            st.error(msg)


def _safe_audit_dict(payload: Any) -> Dict[str, Any]:
    """Return a dict payload for audit JSON values."""
    return payload if isinstance(payload, dict) else {}


def _audit_employee_name(log: Dict[str, Any]) -> str:
    """Extract the employee name affected by an audit log row."""
    new_values = _safe_audit_dict(log.get("new_values"))
    old_values = _safe_audit_dict(log.get("old_values"))
    return str(new_values.get("employee") or old_values.get("employee") or "Unknown")


def _format_audit_value(value: Any) -> str:
    """Format a single audit value for UI display."""
    if value is None:
        return "None"
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return str(value)


def _get_changed_fields(log: Dict[str, Any]) -> List[Dict[str, str]]:
    """Build before/after rows for changed fields on edit actions."""
    old_values = _safe_audit_dict(log.get("old_values"))
    new_values = _safe_audit_dict(log.get("new_values"))
    changed_rows: List[Dict[str, str]] = []

    for field in sorted(set(old_values.keys()) | set(new_values.keys())):
        old_value = old_values.get(field)
        new_value = new_values.get(field)
        if old_value != new_value:
            changed_rows.append(
                {
                    "Field": field,
                    "Before": _format_audit_value(old_value),
                    "After": _format_audit_value(new_value),
                }
            )
    return changed_rows


def _audit_change_summary(log: Dict[str, Any]) -> str:
    """Create a compact one-line summary for an audit row."""
    action = log.get("action")
    employee = _audit_employee_name(log)
    if action == "add":
        return f"Added shift for {employee}"
    if action == "delete":
        return f"Deleted shift for {employee}"
    if action == "edit":
        changed_fields = _get_changed_fields(log)
        if not changed_fields:
            return f"Edited shift for {employee}"
        field_names = ", ".join(row["Field"] for row in changed_fields[:4])
        suffix = "..." if len(changed_fields) > 4 else ""
        return f"Edited {employee}: {field_names}{suffix}"
    return f"{str(action).title()} change for {employee}"


def _load_audit_logs(start_date: date, end_date: date, action_filter: Optional[str]) -> List[Dict[str, Any]]:
    """Load audit logs for the dashboard changelog tab."""
    conn, error = get_db_connection()
    if error or not conn:
        raise ValueError(error or "Could not establish database connection")

    try:
        repo = TimeEntryRepository(DatabaseConnection(conn))
        filters: Dict[str, Any] = {
            "target_table": DatabaseConstants.TIME_ENTRIES_TABLE,
            "start_date": datetime.combine(start_date, time.min),
            "end_date": datetime.combine(end_date, time.max),
            "limit": 500,
        }
        if action_filter:
            filters["action"] = action_filter
        return repo.get_audit_logs(filters)
    finally:
        conn.close()


def show_change_log_tab() -> None:
    """Show the manager audit changelog view."""
    with st.container(border=True):
        st.subheader("Change Log")

        today = date.today()
        default_start = today.replace(day=1)
        date_range = st.date_input(
            "Date range",
            value=(default_start, today),
            key="audit_log_date_range",
        )
    if not isinstance(date_range, (tuple, list)) or len(date_range) != 2:
        st.info("Select a start and end date to view audit logs.")
        return

    start_date, end_date = date_range
    if start_date > end_date:
        st.warning("Start date must be on or before end date.")
        return

    with st.container(border=True):
        action_choice = st.selectbox(
            "Action type",
            options=["All", "add", "edit", "delete"],
            key="audit_log_action_filter",
        )
    action_filter = None if action_choice == "All" else action_choice

    try:
        logs = _load_audit_logs(start_date, end_date, action_filter)
    except Exception as e:
        st.error(f"Failed to load audit logs: {e}")
        return

    employee_names = sorted(
        {
            name
            for name in (_audit_employee_name(log) for log in logs)
            if name and name != "Unknown"
        }
    )
    with st.container(border=True):
        employee_choice = st.selectbox(
            "Employee name",
            options=["All Employees"] + employee_names,
            key="audit_log_employee_filter",
        )

    if employee_choice != "All Employees":
        logs = [log for log in logs if _audit_employee_name(log) == employee_choice]

    if not logs:
        st.info("No audit log entries found for the selected filters.")
        return

    table_rows: List[Dict[str, str]] = []
    for log in logs:
        created_at = log.get("created_at")
        if isinstance(created_at, datetime):
            display_ts = TimeUtils.convert_to_bst(created_at).strftime("%Y-%m-%d %H:%M:%S")
        else:
            display_ts = str(created_at)
        table_rows.append(
            {
                "Timestamp": display_ts,
                "Action": str(log.get("action", "")).upper(),
                "Employee Affected": _audit_employee_name(log),
                "Changed By": str(log.get("changed_by", "")),
                "Summary of Changes": _audit_change_summary(log),
            }
        )

    with st.container(border=True):
        st.dataframe(table_rows, use_container_width=True)

    edit_logs = [log for log in logs if log.get("action") == "edit"]
    if not edit_logs:
        return

    with st.container(border=True):
        st.markdown("### Edit Diffs")
        for log in edit_logs:
            changed_fields = _get_changed_fields(log)
            if not changed_fields:
                continue

            created_at = log.get("created_at")
            if isinstance(created_at, datetime):
                display_ts = TimeUtils.convert_to_bst(created_at).strftime("%Y-%m-%d %H:%M:%S")
            else:
                display_ts = str(created_at)

            label = f"{display_ts} | {_audit_employee_name(log)} | {log.get('changed_by', '')}"
            with st.expander(label, expanded=False):
                st.dataframe(changed_fields, use_container_width=True)


def show() -> None:
    """Display the manager dashboard."""
    # Require manager role
    if not check_manager_role():
        return
    
    # Show header
    show_manager_header()
    
    # Manager controls tabs
    tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
        "View All Entries",
        "Add Shift",
        "Edit Shift",
        "Delete Entry",
        "Manage Users",
        "Change Log",
    ])

    with tab1:
        show_all_entries_tab()

    with tab2:
        show_add_shift_tab()

    with tab3:
        show_edit_shift_tab()

    with tab4:
        show_delete_entry_tab()

    with tab5:
        show_manage_users_tab()

    with tab6:
        show_change_log_tab()

    render_footer()
