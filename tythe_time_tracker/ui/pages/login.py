"""Login page for the Tythe Barn Time Tracker."""

import streamlit as st

from ...core.auth import authenticate_user
from ...database.init import bootstrap_seed_manager, run_seed_if_empty
from ..components.footer import render_footer
from ..components.logos import render_tythe_only


def show() -> None:
    """Display the login form as the app landing page."""
    # Ensure seed manager exists when table is empty and secrets are set (e.g. Streamlit Cloud)
    if run_seed_if_empty():
        st.rerun()

    render_tythe_only(width=200)
    st.markdown("<br>", unsafe_allow_html=True)

    st.markdown(
        """
        <style>
        /* Tythe Barn palette: warm creams, sage, earthy - not stark white */
        [data-testid="stAppViewContainer"] {
            background: linear-gradient(180deg, #f8f6f3 0%, #f0ebe5 100%) !important;
        }
        .tt-login-hero {
            background: linear-gradient(180deg, #fdfcfb 0%, #f5f2ed 100%);
            border: 1px solid #d4cfc4;
            border-radius: 14px;
            padding: 1.1rem 1.2rem;
            box-shadow: 0 2px 8px rgba(45, 42, 38, 0.06);
            margin-bottom: 1rem;
        }
        .tt-login-eyebrow {
            color: #5c6b4a;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin: 0 0 0.35rem 0;
        }
        .tt-login-title {
            color: #2d2a26;
            font-size: 1.55rem;
            font-weight: 700;
            margin: 0;
        }
        .tt-login-subtitle {
            color: #5a5349;
            font-size: 0.95rem;
            margin: 0.35rem 0 0 0;
        }
        /* Login form: visible inputs with light bg and clear border */
        div[data-testid="stForm"] {
            border: 1px solid #d4cfc4;
            border-radius: 12px;
            background: #fdfcfb;
            padding: 1rem 1rem 0.5rem 1rem;
            box-shadow: 0 1px 4px rgba(45, 42, 38, 0.04);
        }
        /* Login inputs: light bg, clear border, readable */
        div[data-testid="stForm"] .stTextInput input,
        div[data-testid="stForm"] input {
            background: #ffffff !important;
            border: 2px solid #c9c2b5 !important;
            border-radius: 8px !important;
            color: #2d2a26 !important;
        }
        div[data-testid="stForm"] .stTextInput input:focus,
        div[data-testid="stForm"] input:focus {
            border-color: #5c6b4a !important;
            box-shadow: 0 0 0 2px rgba(92, 107, 74, 0.2) !important;
        }
        /* Login button: readable, Tythe sage green */
        div[data-testid="stForm"] .stButton > button {
            background: #5c6b4a !important;
            color: #ffffff !important;
            border: none !important;
            font-weight: 600;
        }
        div[data-testid="stForm"] .stButton > button:hover {
            background: #4a5a3a !important;
            color: #ffffff !important;
        }
        div[data-testid="stExpander"] {
            border-radius: 12px;
        }
        </style>
        <div class="tt-login-hero">
            <p class="tt-login-eyebrow">Secure Access</p>
            <p class="tt-login-title">Employee Portal — The Tythe Barn</p>
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
