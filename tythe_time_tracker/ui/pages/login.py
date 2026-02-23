"""Login page for the Tythe Barn Time Tracker."""

from pathlib import Path

import streamlit as st

from ...core.auth import authenticate_user
from ...database.init import bootstrap_seed_manager, run_seed_if_empty
from ..components.footer import render_footer


def show() -> None:
    """Display the login form as the app landing page."""
    # Ensure seed manager exists when table is empty and secrets are set (e.g. Streamlit Cloud)
    if run_seed_if_empty():
        st.rerun()

    logo_path = Path(__file__).resolve().parent.parent.parent / "static" / "kari-logo.png"
    if logo_path.exists():
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            st.image(str(logo_path), width=180)
        st.markdown("<br>", unsafe_allow_html=True)

    st.markdown(
        """
        <style>
        .tt-login-hero {
            background: linear-gradient(180deg, #ffffff 0%, #f6f9fc 100%);
            border: 1px solid #d6dee8;
            border-radius: 14px;
            padding: 1.1rem 1.2rem;
            box-shadow: 0 2px 8px rgba(15, 30, 45, 0.04);
            margin-bottom: 1rem;
        }
        .tt-login-eyebrow {
            color: #1f4e79;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin: 0 0 0.35rem 0;
        }
        .tt-login-title {
            color: #142434;
            font-size: 1.55rem;
            font-weight: 700;
            margin: 0;
        }
        .tt-login-subtitle {
            color: #5f6f82;
            font-size: 0.95rem;
            margin: 0.35rem 0 0 0;
        }
        div[data-testid="stForm"] {
            border: 1px solid #d6dee8;
            border-radius: 12px;
            background: #ffffff;
            padding: 1rem 1rem 0.5rem 1rem;
            box-shadow: 0 1px 4px rgba(15, 30, 45, 0.03);
        }
        div[data-testid="stExpander"] {
            border-radius: 12px;
        }
        </style>
        <div class="tt-login-hero">
            <p class="tt-login-eyebrow">Secure Access</p>
            <p class="tt-login-title">The Tythe Barn Time Tracker</p>
            <p class="tt-login-subtitle">
                Employee and manager timekeeping for daily operations.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    st.caption("Please log in to continue.")

    with st.expander("First time? Create the first manager account"):
        st.markdown(
            "Add **SEED_MANAGER_USERNAME** and **SEED_MANAGER_PASSWORD** under the `[SUPABASE]` section in Streamlit secrets, then click below."
        )
        if st.button("Create first admin from secrets"):
            ok, msg = bootstrap_seed_manager()
            if ok:
                st.success(msg)
                st.rerun()
            else:
                st.error(msg)

    with st.form("login_form"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Log In")

    if submitted:
        if not username or not password:
            st.error("Please enter your username and password.")
        else:
            user = authenticate_user(username, password)
            if user is None:
                st.error("Invalid username or password.")
            else:
                st.session_state.current_user = user
                st.rerun()

    render_footer()
