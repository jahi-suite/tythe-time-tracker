import base64
from pathlib import Path

import streamlit as st

_KARI_PATH = Path(__file__).resolve().parent.parent.parent / "static" / "kari-logo.png"


def render_footer() -> None:
    """Render the footer with tiny Kari logo inline next to 'Powered by Kari Suite'."""
    kari_data_uri = ""
    if _KARI_PATH.exists():
        encoded = base64.b64encode(_KARI_PATH.read_bytes()).decode("ascii")
        kari_data_uri = f'<img src="data:image/png;base64,{encoded}" alt="Kari" style="height:14px;width:auto;vertical-align:middle;margin-right:4px;">'

    st.markdown(
        f"""
        <style>
        .kari-footer {{
            text-align: center;
            color: #5f6f82;
            font-size: 0.75rem;
            padding: 1.5rem 0 1rem 0;
        }}
        .kari-footer hr {{
            border: none;
            border-top: 1px solid #e0e0e0;
            margin-bottom: 0.75rem;
        }}
        .kari-footer-inline {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }}
        .kari-footer-note {{
            margin-top: 0.35rem;
            font-size: 0.7rem;
            color: #6f7f92;
        }}
        </style>
        <div class="kari-footer">
            <hr>
            <span class="kari-footer-inline">{kari_data_uri}Powered by Kari Suite</span>
            <div class="kari-footer-note">Mobile: use Chrome or Safari 16.6+ (older Safari may fail to load).</div>
        </div>
        """,
        unsafe_allow_html=True,
    )
