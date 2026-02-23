import streamlit as st
from pathlib import Path

_LOGO_PATH = Path(__file__).resolve().parent.parent.parent / "static" / "kari-logo.png"


def render_footer() -> None:
    """Render the 'Powered by Kari Suite' footer with KARI logo at the bottom of a page."""
    st.markdown(
        """
        <style>
        .kari-footer {
            text-align: center;
            color: #5f6f82;
            font-size: 0.75rem;
            padding: 1.5rem 0 1rem 0;
        }
        .kari-footer hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin-bottom: 0.75rem;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
    if _LOGO_PATH.exists():
        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            st.image(str(_LOGO_PATH), width=100)
    st.markdown(
        """
        <div class="kari-footer">
            <hr>
            Powered by Kari Suite
        </div>
        """,
        unsafe_allow_html=True,
    )
