"""Login page for the Tythe Barn Time Tracker."""

import streamlit as st

from ...core.auth import authenticate_user
from ...database.init import bootstrap_seed_manager, run_seed_if_empty


def show() -> None:
    """Display the login form as the app landing page."""
    # Ensure seed manager exists when table is empty and secrets are set (e.g. Streamlit Cloud)
    if run_seed_if_empty():
        st.rerun()

    st.title("The Tythe Barn - Time Tracker")
    st.subheader("Please log in to continue")

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

    st.markdown(
        """
        <div style="text-align: center; margin-top: 2.5rem; padding: 1rem 0;">
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin-bottom: 1.25rem;" />
            <p style="color: #888888; font-size: 1.0rem; font-weight: 500; letter-spacing: 0.04em; margin: 0;">
                Powered by <span style="color: #555555; font-weight: 700;">Kari Suite</span>
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )
