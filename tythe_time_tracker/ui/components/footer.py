import streamlit as st

from .logos import render_logos


def render_footer() -> None:
    """Render the footer with Tythe (bigger) and Kari (smaller) logos, plus 'Powered by Kari Suite'."""
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
    render_logos(tythe_width=160, kari_width=70, layout="stacked")
    st.markdown(
        """
        <div class="kari-footer">
            <hr>
            Powered by Kari Suite
        </div>
        """,
        unsafe_allow_html=True,
    )
