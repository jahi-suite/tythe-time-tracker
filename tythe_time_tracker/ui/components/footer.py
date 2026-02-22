import streamlit as st


def render_footer() -> None:
    """Render the 'Powered by Kari Suite' footer at the bottom of a page."""
    st.markdown(
        """
        <style>
        .kari-footer {
            text-align: center;
            color: #999999;
            font-size: 0.75rem;
            padding: 1.5rem 0 1rem 0;
        }
        .kari-footer hr {
            border: none;
            border-top: 1px solid #e0e0e0;
            margin-bottom: 0.75rem;
        }
        </style>
        <div class="kari-footer">
            <hr>
            Powered by Kari Suite
        </div>
        """,
        unsafe_allow_html=True,
    )
