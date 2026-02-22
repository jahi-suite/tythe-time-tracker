"""Login page for the Tythe Barn Time Tracker."""

import streamlit as st

from ...core.auth import authenticate_user


def show() -> None:
    """Display the login form as the app landing page."""
    st.title("The Tythe Barn - Time Tracker")
    st.subheader("Please log in to continue")

    with st.form("login_form"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Log In")

    if submitted:
        if not username or not password:
            st.error("Please enter your username and password.")
            return

        user = authenticate_user(username, password)
        if user is None:
            st.error("Invalid username or password.")
        else:
            st.session_state.current_user = user
            st.rerun()
