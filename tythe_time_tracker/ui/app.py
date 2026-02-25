"""
Main Streamlit application module.

This module handles the core app configuration, navigation, and main layout.
"""

import streamlit as st
from typing import Optional

from ..config.settings import get_app_config
from ..core.auth import change_password_self
from ..database.init import ensure_database_ready
from .pages import (
    employee_interface,
    export_interface,
    login,
    manager_dashboard,
    personal_timesheet,
)


def setup_page_config() -> None:
    """Configure Streamlit page settings."""
    st.set_page_config(
        page_title="Employee Portal - The Tythe Barn",
        page_icon="⏱",
        initial_sidebar_state="collapsed",
    )
    st.markdown(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">',
        unsafe_allow_html=True,
    )
    st.markdown(
        """<style>
/* Fix blurred/faded Streamlit default headers - force crisp, readable text */
h1, h2, h3, h4, .stMarkdown h1, .stMarkdown h2, .stMarkdown h3, .stMarkdown h4,
[data-testid="stHeader"], [data-testid="stHeader"] *,
div[data-testid="stHeader"] {
    opacity: 1 !important;
    filter: none !important;
    color: #142434 !important;
    font-weight: 600 !important;
}

/* Corporate theme palette and typography */
:root {
    --tt-primary: #1f4e79;
    --tt-primary-dark: #163a5c;
    --tt-accent: #2c6ea3;
    --tt-surface: #ffffff;
    --tt-surface-muted: #f4f7fb;
    --tt-border: #d6dee8;
    --tt-text: #1e2a36;
    --tt-text-muted: #5f6f82;
    --tt-success-bg: #edf7f2;
    --tt-success-border: #6ea889;
    --tt-error-bg: #fbeff0;
    --tt-error-border: #bb6670;
    --tt-info-bg: #eef5fc;
    --tt-info-border: #6d94bd;
}

/* Base: larger font for readability */
html {
    font-size: 18px;
}
body, [class*="css"] {
    color: var(--tt-text);
    font-size: 1rem;
}

.stApp {
    background: linear-gradient(180deg, #f7f9fc 0%, #eef3f8 100%);
}

.block-container {
    max-width: 1100px;
    padding-top: 1.5rem;
}

h1, h2, h3, h4 {
    color: #142434 !important;
    letter-spacing: -0.01em;
    opacity: 1 !important;
    filter: none !important;
    font-weight: 600 !important;
}
h1 { font-size: 1.9rem !important; }
h2 { font-size: 1.5rem !important; }
h3 { font-size: 1.25rem !important; }

/* Override Streamlit's faded header/title styling */
.stMarkdown h1, .stMarkdown h2, .stMarkdown h3, .stMarkdown h4,
[class*="stMarkdown"] h1, [class*="stMarkdown"] h2 {
    color: #142434 !important;
    opacity: 1 !important;
}

p, li, label, .stMarkdown, .stCaption {
    color: var(--tt-text);
    font-size: 1.05rem;
    line-height: 1.5;
}
/* Labels and form text: darker, larger for readability */
label, [data-testid="stWidgetLabel"] {
    color: #1e2a36 !important;
    font-size: 1.05rem !important;
}

[data-testid="stSidebar"] {
    background: #f7f9fc;
    border-right: 1px solid var(--tt-border);
}

[data-testid="stSidebar"] * {
    color: var(--tt-text);
    font-size: 1.05rem !important;
}

/* Buttons: high-contrast for readability - dark text on light bg */
.stButton > button {
    background: #f0f4f8 !important;
    color: #142434 !important;
    border: 2px solid var(--tt-primary);
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
.stButton > button:hover {
    background: #e2e8f0 !important;
    color: #142434 !important;
    border-color: var(--tt-primary-dark);
}
.stButton > button:focus {
    box-shadow: 0 0 0 3px rgba(44, 110, 163, 0.2);
}

/* Primary buttons: white on blue for emphasis */
.stButton > button[data-testid="baseButton-primary"] {
    background: linear-gradient(180deg, var(--tt-primary) 0%, var(--tt-primary-dark) 100%) !important;
    color: #ffffff !important;
    border: 1px solid var(--tt-primary-dark);
}
.stButton > button[data-testid="baseButton-primary"]:hover {
    background: linear-gradient(180deg, #235886 0%, #173d60 100%) !important;
    color: #ffffff !important;
}

/* Form controls: ensure dark, readable text; larger font */
.stTextInput input, .stSelectbox div, .stDateInput input, .stTimeInput input,
.stNumberInput input, .stTextArea textarea,
[data-testid="stSelectbox"] label, [data-testid="stTextInput"] label {
    color: #1e2a36 !important;
    font-size: 1.05rem !important;
}
[data-testid="stSelectbox"] > div > div {
    color: #1e2a36 !important;
}

.stTextInput > div > div,
.stSelectbox > div > div,
.stDateInput > div > div,
.stTimeInput > div > div,
.stNumberInput > div > div,
.stTextArea > div > div {
    border-radius: 8px;
}

div[data-testid="stAlert"] {
    border-radius: 10px;
    border: 1px solid var(--tt-border);
    box-shadow: 0 1px 2px rgba(12, 22, 34, 0.06);
    font-size: 1.1rem !important;
    padding: 1rem 1.25rem !important;
}
div[data-testid="stAlert"] * {
    color: #1e2a36 !important;
    font-size: inherit !important;
}

div[data-testid="stAlert"][kind="success"] {
    background: var(--tt-success-bg);
    border-color: var(--tt-success-border);
}

div[data-testid="stAlert"][kind="error"] {
    background: var(--tt-error-bg);
    border-color: var(--tt-error-border);
}

div[data-testid="stAlert"][kind="info"] {
    background: var(--tt-info-bg);
    border-color: var(--tt-info-border);
}

.stExpander {
    border: 1px solid var(--tt-border);
    border-radius: 10px;
    background: var(--tt-surface);
}

[data-testid="stDataFrame"],
.stTable {
    border: 1px solid var(--tt-border);
    border-radius: 10px;
    background: var(--tt-surface);
}

hr {
    border: none;
    border-top: 1px solid var(--tt-border);
    margin: 0.5rem 0 1rem;
}

@media (max-width: 768px) {
    .block-container {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
        padding-top: 1rem !important;
    }
    .stButton > button {
        min-height: 44px !important;
        font-size: 1rem !important;
    }
    [data-testid="stSidebar"] {
        width: 80vw !important;
        max-width: 320px !important;
    }
}

@media (min-width: 769px) {
    .stSelectbox > div > div,
    [data-testid="stSelectbox"] > div > div,
    [data-baseweb="select"] > div {
        background-color: #f4f7fb !important;
        color: #1e2a36 !important;
    }

    [data-baseweb="select"] input,
    [data-baseweb="select"] span,
    [data-baseweb="select"] div {
        color: #1e2a36 !important;
    }
}
</style>""",
        unsafe_allow_html=True,
    )


def initialize_database() -> None:
    """Initialize the database on app startup."""
    ready, error_message = ensure_database_ready()
    if not ready:
        st.error("❌ Failed to initialize database. Please check your configuration.")
        if error_message:
            st.code(error_message, language=None)
        with st.expander("💡 Fix for Streamlit Cloud (use Session pooler)", expanded=True):
            st.markdown(
                "Direct connection (db.xxx:5432) does not work from Streamlit Cloud (IPv4). "
                "In Supabase click **Connect** → set Method to **Session pooler** → copy the **host** from the URI."
            )
            st.markdown("Then in Streamlit Cloud → Settings → Secrets use this (replace the host with yours):")
                st.code(
                    '''[SUPABASE]
HOST = "aws-0-XX-XXXXX.pooler.supabase.com"
DATABASE = "postgres"
USER = "postgres.YOUR_PROJECT_REF"
PASSWORD = "your-database-password"
PORT = "6543"

MANAGER_PASSWORD = "your-manager-password"''',
                    language="toml",
                )
            st.caption("See STREAMLIT_CLOUD_DATABASE.md in the repo for step-by-step.")
        st.stop()


def show_pay_rate_info() -> None:
    """Display pay rate information in an expander."""
    with st.expander("Pay Rate Information", expanded=False):
        st.markdown("""
        **Pay Rate Rules:**
        - **Standard Rate:** Regular hours (4:00 AM - 7:00 PM)
        - **Enhanced Rate:** Night hours (7:00 PM - 4:00 AM) 
        - **Supervisor Rate:** When supervisor role is selected (overrides other rates)
        
        **Note:** If you clock in during enhanced hours AND select supervisor role, you'll receive the supervisor rate.
        """)


def show_navigation() -> str:
    """Display navigation sidebar and return selected page."""
    user = st.session_state.current_user
    st.sidebar.markdown(f"**Logged in as:** {user['display_name']}  \n*({user['role']})*")
    if st.sidebar.button("Logout", key="sidebar_logout"):
        del st.session_state["current_user"]
        st.rerun()
    st.sidebar.markdown("---")
    with st.sidebar.expander("Change my password", expanded=False):
        with st.form("sidebar_change_password_form", clear_on_submit=True):
            current_password = st.text_input("Current password", type="password")
            new_password = st.text_input("New password", type="password")
            confirm_password = st.text_input("Confirm new password", type="password")
            change_password_submitted = st.form_submit_button("Change password", type="primary")

        if change_password_submitted:
            if not current_password or not new_password or not confirm_password:
                st.error("All password fields are required.")
            elif new_password != confirm_password:
                st.error("New password and confirmation do not match.")
            else:
                ok, message = change_password_self(str(user.get("id") or ""), current_password, new_password)
                if ok:
                    st.success(message)
                else:
                    st.error(message)
    st.sidebar.markdown("---")
    return st.sidebar.selectbox(
        "Choose a page:",
        ["Employee Clock In/Out", "Personal Timesheet", "Export Timesheet", "Manager Dashboard"]
    )


def show_version_info() -> None:
    """Display version information in the sidebar."""
    config = get_app_config()
    st.sidebar.markdown(
        f"<div style='text-align:right; color: #5f6f82; font-size: 0.9em;'>Version: {config.version}</div>",
        unsafe_allow_html=True
    )


def route_to_page(page: str) -> None:
    """Route to the appropriate page based on selection."""
    if page == "Employee Clock In/Out":
        employee_interface.show()
    elif page == "Personal Timesheet":
        personal_timesheet.show()
    elif page == "Export Timesheet":
        export_interface.show()
    elif page == "Manager Dashboard":
        manager_dashboard.show()


def main() -> None:
    """Main application entry point."""
    # Setup page configuration
    setup_page_config()
    
    # Initialize database
    initialize_database()

    # Gate: show login page if user is not authenticated
    if "current_user" not in st.session_state:
        login.show()
        return

    # Main title
    st.title("Employee Portal — The Tythe Barn")
    st.markdown("---")
    
    # Show pay rate information
    show_pay_rate_info()
    
    # Navigation
    selected_page = show_navigation()
    
    # Route to selected page
    route_to_page(selected_page)
    
    # Show version info
    show_version_info()


if __name__ == "__main__":
    main()
