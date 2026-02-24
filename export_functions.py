import pandas as pd
import streamlit as st
from datetime import datetime, timedelta, timezone, time as dtime
from reportlab.lib import colors

from tythe_time_tracker.utils.time_utils import TimeUtils
from tythe_time_tracker.core.auth import get_all_users
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
import base64

def get_date_range(option):
    """Get date range based on selection"""
    today = datetime.now().date()
    
    if option == "This Week":
        # Monday to Sunday
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
    elif option == "Last Week":
        # Previous Monday to Sunday
        start = today - timedelta(days=today.weekday() + 7)
        end = start + timedelta(days=6)
    elif option == "This Month":
        # First to last day of current month
        start = today.replace(day=1)
        if today.month == 12:
            end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
    else:  # Custom range
        return None, None
    
    return start, end

def get_timesheet_data(employee_name=None, start_date=None, end_date=None, is_manager=False):
    """Get timesheet data with filters"""
    conn = st.secrets.get("SUPABASE", {})
    if not conn:
        return []
    
    try:
        import psycopg2
        db_conn = psycopg2.connect(
            host=st.secrets["SUPABASE"]["HOST"],
            database=st.secrets["SUPABASE"]["DATABASE"],
            user=st.secrets["SUPABASE"]["USER"],
            password=st.secrets["SUPABASE"]["PASSWORD"],
            port=st.secrets["SUPABASE"]["PORT"],
            options='-c family=ipv4'
        )
        
        cursor = db_conn.cursor()
        
        # Build query based on filters
        query = """
            SELECT id, employee, clock_in, clock_out, pay_rate_type, created_at
            FROM time_entries 
            WHERE 1=1
        """
        params = []
        
        if employee_name:
            query += " AND LOWER(employee) = LOWER(%s)"
            params.append(employee_name)
        
        if start_date:
            query += " AND DATE(clock_in) >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND DATE(clock_in) <= %s"
            params.append(end_date)
        
        query += " ORDER BY employee, clock_in DESC"
        
        cursor.execute(query, params)
        entries = cursor.fetchall()
        
        cursor.close()
        db_conn.close()
        
        return entries
        
    except Exception as e:
        st.error(f"Database error: {e}")
        return []

def calculate_hours(clock_in, clock_out):
    """Calculate hours worked"""
    if not clock_out:
        return 0  # Return 0 for in-progress shifts
    
    duration = clock_out - clock_in
    hours = duration.total_seconds() / 3600
    return round(hours, 2)

def get_bst_time(utc_time):
    """Convert UTC to UK local time (GMT/BST). Use TimeUtils for DST-safe conversion."""
    return TimeUtils.convert_to_bst(utc_time)

def is_bst_enhanced_hours(dt):
    # dt should be BST
    hour = dt.hour
    return hour >= 19 or hour < 4

def split_shift_by_rate(clock_in, clock_out, is_supervisor):
    """
    Returns a dict: {'Standard': hours, 'Enhanced': hours, 'Supervisor': hours}
    All times are assumed to be UTC and will be converted to BST for rate logic.
    Splits at 19:00 (7PM) and 04:00 (4AM) BST boundaries.
    Handles overnight shifts correctly.
    """
    if not clock_out:
        return {'Standard': 0, 'Enhanced': 0, 'Supervisor': 0}
    if is_supervisor:
        total = (clock_out - clock_in).total_seconds() / 3600
        return {'Standard': 0, 'Enhanced': 0, 'Supervisor': round(total, 2)}
    # Convert to BST and make naive for comparison
    bst_in = get_bst_time(clock_in).replace(tzinfo=None)
    bst_out = get_bst_time(clock_out).replace(tzinfo=None)
    if bst_out <= bst_in:
        return {'Standard': 0, 'Enhanced': 0, 'Supervisor': 0}
    
    # Enhanced window: 19:00 BST to 04:00 BST next day
    # Always ends at 4:00 BST on the day after the shift starts
    if bst_in.hour < 4:
        # Shift starts in early morning, enhanced window is 19:00 previous day to 04:00 current day
        enhanced_start = datetime.combine(bst_in.date() - timedelta(days=1), dtime(19, 0))
        enhanced_end = datetime.combine(bst_in.date(), dtime(4, 0))
    else:
        # Shift starts after 4 AM, enhanced window is 19:00 current day to 04:00 next day
        enhanced_start = datetime.combine(bst_in.date(), dtime(19, 0))
        enhanced_end = datetime.combine(bst_in.date() + timedelta(days=1), dtime(4, 0))
    
    # Calculate overlap with enhanced window
    enh_start = max(bst_in, enhanced_start)
    enh_end = min(bst_out, enhanced_end)
    enhanced_hours = max((enh_end - enh_start).total_seconds() / 3600, 0) if enh_start < enh_end else 0
    # Standard: the rest
    total_hours = (bst_out - bst_in).total_seconds() / 3600
    standard_hours = total_hours - enhanced_hours
    return {
        'Standard': round(standard_hours, 2),
        'Enhanced': round(enhanced_hours, 2),
        'Supervisor': 0
    }

def apply_break_deduction(split):
    """Apply a 20-minute unpaid break for 6h+ shifts to the majority rate bucket."""
    adjusted = {
        'Standard': round(float(split.get('Standard', 0) or 0), 2),
        'Enhanced': round(float(split.get('Enhanced', 0) or 0), 2),
        'Supervisor': round(float(split.get('Supervisor', 0) or 0), 2),
    }

    total_hours = adjusted['Standard'] + adjusted['Enhanced'] + adjusted['Supervisor']
    if total_hours < 6:
        return adjusted

    break_hours = 20 / 60
    order = ['Standard', 'Enhanced', 'Supervisor']
    majority = 'Standard'
    max_hours = adjusted['Standard']

    for key in order[1:]:
        if adjusted[key] > max_hours:
            majority = key
            max_hours = adjusted[key]

    adjusted[majority] -= min(adjusted[majority], break_hours)

    adjusted['Standard'] = round(adjusted['Standard'], 2)
    adjusted['Enhanced'] = round(adjusted['Enhanced'], 2)
    adjusted['Supervisor'] = round(adjusted['Supervisor'], 2)
    return adjusted

def _get_user_rates_map():
    """Build map of display_name (lower) -> {standard_rate, enhanced_rate, supervisor_rate}."""
    users = get_all_users()
    return {
        u["display_name"].strip().lower(): {
            "standard_rate": u.get("standard_rate"),
            "enhanced_rate": u.get("enhanced_rate"),
            "supervisor_rate": u.get("supervisor_rate"),
        }
        for u in users
    }


def _format_pay(amount):
    """Format pay amount as £X.XX or — if None/zero."""
    if amount is None or amount == 0:
        return "—"
    return f"£{amount:.2f}"


def calculate_staff_summary(entries, user_rates_map=None):
    """Calculate summary by staff member with hours per pay rate type.
    If user_rates_map is provided, adds standard_pay, enhanced_pay, supervisor_pay, total_pay.
    """
    staff_summary = {}

    for entry in entries:
        # Handle both TimeEntry objects and tuples for backward compatibility
        if hasattr(entry, "employee"):
            employee = entry.employee
            clock_in = entry.clock_in
            clock_out = entry.clock_out
            pay_rate_type = (
                entry.pay_rate_type.value
                if hasattr(entry.pay_rate_type, "value")
                else entry.pay_rate_type
            )
        else:
            entry_id, employee, clock_in, clock_out, pay_rate_type, created_at = entry

        is_supervisor = pay_rate_type == "Supervisor"
        split = apply_break_deduction(
            split_shift_by_rate(clock_in, clock_out, is_supervisor)
        )

        if employee not in staff_summary:
            staff_summary[employee] = {
                "Standard": 0,
                "Enhanced": 0,
                "Supervisor": 0,
                "total_hours": 0,
                "total_shifts": 0,
            }

        staff_summary[employee]["Standard"] += split["Standard"]
        staff_summary[employee]["Enhanced"] += split["Enhanced"]
        staff_summary[employee]["Supervisor"] += split["Supervisor"]
        staff_summary[employee]["total_hours"] += sum(split.values())
        staff_summary[employee]["total_shifts"] += 1

    # Enrich with pay amounts if rates available
    if user_rates_map:
        for emp, data in staff_summary.items():
            rates = user_rates_map.get(emp.strip().lower(), {})
            std_r = rates.get("standard_rate")
            enh_r = rates.get("enhanced_rate")
            sup_r = rates.get("supervisor_rate")
            data["standard_pay"] = (
                round(data["Standard"] * std_r, 2) if std_r is not None else None
            )
            data["enhanced_pay"] = (
                round(data["Enhanced"] * enh_r, 2) if enh_r is not None else None
            )
            data["supervisor_pay"] = (
                round(data["Supervisor"] * sup_r, 2) if sup_r is not None else None
            )
            total = 0.0
            has_any = False
            for p in (data.get("standard_pay"), data.get("enhanced_pay"), data.get("supervisor_pay")):
                if p is not None:
                    total += p
                    has_any = True
            data["total_pay"] = round(total, 2) if has_any else None

    return staff_summary

def calculate_summary(entries):
    """Calculate overall summary statistics"""
    staff_summary = calculate_staff_summary(entries)
    
    total_hours = sum(staff['total_hours'] for staff in staff_summary.values())
    total_shifts = sum(staff['total_shifts'] for staff in staff_summary.values())
    unique_employees = len(staff_summary)
    
    return {
        'total_hours': round(total_hours, 2),
        'total_shifts': total_shifts,
        'unique_employees': unique_employees,
        'staff_summary': staff_summary
    }

def export_to_excel(entries, filename="timesheet_export.xlsx", start_date=None, end_date=None):
    """Export timesheet data to Excel with staff summaries and individual shifts"""
    if not entries:
        return None

    user_rates_map = _get_user_rates_map()
    staff_summary = calculate_staff_summary(entries, user_rates_map)
    
    # Sort entries by employee (case-insensitive, trimmed) and clock_in
    # Handle both TimeEntry objects and tuples for backward compatibility
    if entries and hasattr(entries[0], 'employee'):
        # TimeEntry objects
        entries_sorted = sorted(entries, key=lambda e: (e.employee.strip().lower(), e.clock_in))
    else:
        # Tuple format (backward compatibility)
        entries_sorted = sorted(entries, key=lambda e: (e[1].strip().lower(), e[2]))
    
    # Prepare hierarchical data for Excel
    hierarchical_data = []

    def _pay_cols(d):
        if d is None:
            return {"Standard Pay": "—", "Enhanced Pay": "—", "Supervisor Pay": "—", "Total Pay": "—"}
        return {
            "Standard Pay": _format_pay(d.get("standard_pay")),
            "Enhanced Pay": _format_pay(d.get("enhanced_pay")),
            "Supervisor Pay": _format_pay(d.get("supervisor_pay")),
            "Total Pay": _format_pay(d.get("total_pay")),
        }

    for employee, data in staff_summary.items():
        # Add staff summary row
        row = {
            "Staff Name": f"📊 {employee} - TOTALS",
            "Date": "",
            "Clock-In": "",
            "Clock-Out": "",
            "Standard Hours": data["Standard"],
            "Enhanced Hours": data["Enhanced"],
            "Supervisor Hours": data["Supervisor"],
            "Total Hours": data["total_hours"],
            "Break Deducted": "",
            "Total Shifts": data["total_shifts"],
            "Pay Rate Type": "",
            "Supervisor Flag": "",
        }
        row.update(_pay_cols(data))
        hierarchical_data.append(row)

        # Add individual shifts for this staff member
        for entry in entries_sorted:
            # Handle both TimeEntry objects and tuples for backward compatibility
            if hasattr(entry, 'employee'):
                # TimeEntry object
                emp = entry.employee
                clock_in = entry.clock_in
                clock_out = entry.clock_out
                pay_rate_type = entry.pay_rate_type.value if hasattr(entry.pay_rate_type, 'value') else entry.pay_rate_type
            else:
                # Tuple format (backward compatibility)
                entry_id, emp, clock_in, clock_out, pay_rate_type, created_at = entry
            
            if emp.strip().lower() == employee.strip().lower():
                is_supervisor = (pay_rate_type == 'Supervisor')
                gross_split = split_shift_by_rate(clock_in, clock_out, is_supervisor)
                split = apply_break_deduction(gross_split)
                gross_total_hours = round(sum(gross_split.values()), 2)
                break_deducted = "20 min" if gross_total_hours >= 6 else "—"
                
                # Create a display string for the shift
                if is_supervisor:
                    shift_display = f"Supervisor ({split['Supervisor']}h)"
                elif split['Standard'] > 0 and split['Enhanced'] > 0:
                    shift_display = f"Mixed: {split['Standard']}h Standard, {split['Enhanced']}h Enhanced"
                elif split['Enhanced'] > 0:
                    shift_display = f"Enhanced ({split['Enhanced']}h)"
                else:
                    shift_display = f"Standard ({split['Standard']}h)"
                
                shift_row = {
                    "Staff Name": f"  └─ {employee}",
                    "Date": get_bst_time(clock_in).strftime("%Y-%m-%d"),
                    "Clock-In": get_bst_time(clock_in).strftime("%H:%M:%S"),
                    "Clock-Out": get_bst_time(clock_out).strftime("%H:%M:%S") if clock_out else "In Progress",
                    "Standard Hours": split["Standard"],
                    "Enhanced Hours": split["Enhanced"],
                    "Supervisor Hours": split["Supervisor"],
                    "Total Hours": sum(split.values()),
                    "Break Deducted": break_deducted,
                    "Total Shifts": "",
                    "Pay Rate Type": shift_display,
                    "Supervisor Flag": "Yes" if pay_rate_type == "Supervisor" else "No",
                }
                shift_row.update(_pay_cols(None))
                hierarchical_data.append(shift_row)

        # Add blank row between staff members
        blank_row = {
            "Staff Name": "",
            "Date": "",
            "Clock-In": "",
            "Clock-Out": "",
            "Standard Hours": "",
            "Enhanced Hours": "",
            "Supervisor Hours": "",
            "Total Hours": "",
            "Break Deducted": "",
            "Total Shifts": "",
            "Pay Rate Type": "",
            "Supervisor Flag": "",
        }
        blank_row.update(_pay_cols(None))
        hierarchical_data.append(blank_row)
    
    # Create DataFrame
    df_hierarchical = pd.DataFrame(hierarchical_data)
    
    # Calculate overall summary
    overall_summary = calculate_summary(entries)
    
    # Create Excel file with multiple sheets
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        # Hierarchical view (main sheet)
        df_hierarchical.to_excel(writer, sheet_name='Staff Hours & Shifts', index=False)
        staff_sheet = writer.sheets['Staff Hours & Shifts']
        note_row = len(df_hierarchical) + 3  # header row + one blank row + note
        staff_sheet.cell(
            row=note_row,
            column=1,
            value="20 minutes unpaid break deducted for shifts of 6+ hours (deducted from majority rate type).",
        )
        
        # Overall summary sheet
        summary_data = {
            'Metric': ['Total Hours', 'Total Shifts', 'Unique Employees'],
            'Value': [overall_summary['total_hours'], overall_summary['total_shifts'], overall_summary['unique_employees']]
        }
        if start_date and end_date:
            summary_data['Metric'].extend(['Date Range'])
            summary_data['Value'].extend([f"{start_date} to {end_date}"])
        
        summary_df = pd.DataFrame(summary_data)
        summary_df.to_excel(writer, sheet_name='Overall Summary', index=False)
    
    return filename

def export_to_pdf(entries, filename="timesheet_export.pdf"):
    """Export timesheet data to PDF with staff summaries and individual shifts grouped under each staff member"""
    if not entries:
        return None

    user_rates_map = _get_user_rates_map()
    staff_summary = calculate_staff_summary(entries, user_rates_map)
    overall_summary = calculate_summary(entries)
    
    # Overall summary section
    summary_text = f"""
    <b>Overall Summary:</b><br/>
    Total Hours: {overall_summary['total_hours']}<br/>
    Total Shifts: {overall_summary['total_shifts']}<br/>
    Unique Employees: {overall_summary['unique_employees']}<br/>
    """
    summary_para = Paragraph(summary_text, styles['Normal'])
    story.append(summary_para)
    break_note_para = Paragraph(
        "20 minutes unpaid break deducted for shifts of 6+ hours (deducted from majority rate type).",
        styles['Normal'],
    )
    story.append(break_note_para)
    story.append(Spacer(1, 20))
    
    # Sort entries by employee and clock_in
    # Handle both TimeEntry objects and tuples for backward compatibility
    if entries and hasattr(entries[0], 'employee'):
        # TimeEntry objects
        entries_sorted = sorted(entries, key=lambda e: (e.employee.strip().lower(), e.clock_in))
    else:
        # Tuple format (backward compatibility)
        entries_sorted = sorted(entries, key=lambda e: (e[1].strip().lower(), e[2]))
    
    # For each staff member, show totals and then their shifts
    for employee, data in staff_summary.items():
        # Staff summary row
        staff_title = Paragraph(f"<b>{employee} - TOTALS</b>", styles["Heading3"])
        story.append(staff_title)
        headers = ["Standard Hours", "Enhanced Hours", "Supervisor Hours", "Total Hours", "Total Shifts"]
        values = [
            str(data["Standard"]),
            str(data["Enhanced"]),
            str(data["Supervisor"]),
            str(data["total_hours"]),
            str(data["total_shifts"]),
        ]
        if "total_pay" in data:
            headers.extend(["Standard Pay", "Enhanced Pay", "Supervisor Pay", "Total Pay"])
            values.extend([
                _format_pay(data.get("standard_pay")),
                _format_pay(data.get("enhanced_pay")),
                _format_pay(data.get("supervisor_pay")),
                _format_pay(data.get("total_pay")),
            ])
        staff_table = Table([headers, values])
        staff_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
        ]))
        story.append(staff_table)
        story.append(Spacer(1, 8))
        
        # Individual shifts for this staff member
        shift_rows = [["Date", "Clock-In", "Clock-Out", "Standard", "Enhanced", "Supervisor", "Total", "Break Deducted", "Type"]]
        for entry in entries_sorted:
            # Handle both TimeEntry objects and tuples for backward compatibility
            if hasattr(entry, 'employee'):
                # TimeEntry object
                emp = entry.employee
                clock_in = entry.clock_in
                clock_out = entry.clock_out
                pay_rate_type = entry.pay_rate_type.value if hasattr(entry.pay_rate_type, 'value') else entry.pay_rate_type
            else:
                # Tuple format (backward compatibility)
                entry_id, emp, clock_in, clock_out, pay_rate_type, created_at = entry
            
            if emp.strip().lower() == employee.strip().lower():
                is_supervisor = (pay_rate_type == 'Supervisor')
                gross_split = split_shift_by_rate(clock_in, clock_out, is_supervisor)
                split = apply_break_deduction(gross_split)
                gross_total_hours = round(sum(gross_split.values()), 2)
                break_deducted = "20 min" if gross_total_hours >= 6 else "—"
                if is_supervisor:
                    shift_display = f"Supervisor ({split['Supervisor']}h)"
                elif split['Standard'] > 0 and split['Enhanced'] > 0:
                    shift_display = f"Mixed: {split['Standard']}h Std, {split['Enhanced']}h Enh"
                elif split['Enhanced'] > 0:
                    shift_display = f"Enhanced ({split['Enhanced']}h)"
                else:
                    shift_display = f"Standard ({split['Standard']}h)"
                shift_rows.append([
                    get_bst_time(clock_in).strftime('%Y-%m-%d'),
                    get_bst_time(clock_in).strftime('%H:%M'),
                    get_bst_time(clock_out).strftime('%H:%M') if clock_out else 'In Progress',
                    str(split['Standard']),
                    str(split['Enhanced']),
                    str(split['Supervisor']),
                    str(sum(split.values())),
                    break_deducted,
                    shift_display
                ])
        if len(shift_rows) > 1:
            shift_table = Table(shift_rows)
            shift_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
            ]))
            story.append(shift_table)
            story.append(Spacer(1, 16))
        else:
            story.append(Paragraph("No shifts for this period.", styles['Normal']))
            story.append(Spacer(1, 16))
    
    # Build PDF
    doc.build(story)
    return filename

def get_download_link(file_path, file_name, file_type):
    """Create download link for files"""
    with open(file_path, "rb") as f:
        data = f.read()
    
    b64 = base64.b64encode(data).decode()
    href = f'<a href="data:application/{file_type};base64,{b64}" download="{file_name}">Download {file_name}</a>'
    return href 

def get_hierarchical_staff_shift_data(entries):
    """
    Returns a list of dicts: staff total row, then their shifts, then blank row, for all staff.
    Each dict has keys: Staff Name, Date, Clock-In, Clock-Out, Standard Hours, Enhanced Hours, Supervisor Hours, Total Hours, Total Shifts, Pay Rate Type, Supervisor Flag
    """
    staff_summary = calculate_staff_summary(entries)
    # Sort entries by employee (case-insensitive, trimmed) and clock_in
    entries_sorted = sorted(entries, key=lambda e: (e[1].strip().lower(), e[2]))
    hierarchical_data = []
    for employee, data in staff_summary.items():
        # Add staff summary row
        hierarchical_data.append({
            'Staff Name': f"📊 {employee} - TOTALS",
            'Date': '',
            'Clock-In': '',
            'Clock-Out': '',
            'Standard Hours': data['Standard'],
            'Enhanced Hours': data['Enhanced'],
            'Supervisor Hours': data['Supervisor'],
            'Total Hours': data['total_hours'],
            'Total Shifts': data['total_shifts'],
            'Pay Rate Type': '',
            'Supervisor Flag': ''
        })
        # Add individual shifts for this staff member
        for entry in entries_sorted:
            entry_id, emp, clock_in, clock_out, pay_rate_type, created_at = entry
            if emp.strip().lower() == employee.strip().lower():
                is_supervisor = (pay_rate_type == 'Supervisor')
                split = apply_break_deduction(
                    split_shift_by_rate(clock_in, clock_out, is_supervisor)
                )
                if is_supervisor:
                    shift_display = f"Supervisor ({split['Supervisor']}h)"
                elif split['Standard'] > 0 and split['Enhanced'] > 0:
                    shift_display = f"Mixed: {split['Standard']}h Standard, {split['Enhanced']}h Enhanced"
                elif split['Enhanced'] > 0:
                    shift_display = f"Enhanced ({split['Enhanced']}h)"
                else:
                    shift_display = f"Standard ({split['Standard']}h)"
                hierarchical_data.append({
                    'Staff Name': f"  └─ {employee}",
                    'Date': get_bst_time(clock_in).strftime('%Y-%m-%d'),
                    'Clock-In': get_bst_time(clock_in).strftime('%H:%M:%S'),
                    'Clock-Out': get_bst_time(clock_out).strftime('%H:%M:%S') if clock_out else 'In Progress',
                    'Standard Hours': split['Standard'],
                    'Enhanced Hours': split['Enhanced'],
                    'Supervisor Hours': split['Supervisor'],
                    'Total Hours': sum(split.values()),
                    'Total Shifts': '',
                    'Pay Rate Type': shift_display,
                    'Supervisor Flag': 'Yes' if pay_rate_type == "Supervisor" else 'No'
                })
        # Add blank row between staff members
        hierarchical_data.append({
            'Staff Name': '',
            'Date': '',
            'Clock-In': '',
            'Clock-Out': '',
            'Standard Hours': '',
            'Enhanced Hours': '',
            'Supervisor Hours': '',
            'Total Hours': '',
            'Total Shifts': '',
            'Pay Rate Type': '',
            'Supervisor Flag': ''
        })
    return hierarchical_data 
