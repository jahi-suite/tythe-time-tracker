"""Logo display component: Tythe (primary) and Kari (secondary)."""

from pathlib import Path

import streamlit as st

_STATIC = Path(__file__).resolve().parent.parent.parent / "static"
_TYTHE_PATH = _STATIC / "tythe-logo.png"
_KARI_PATH = _STATIC / "kari-logo.png"


def render_logos(tythe_width: int = 200, kari_width: int = 80, layout: str = "stacked") -> None:
    """
    Render Tythe (bigger) and Kari (smaller) logos.

    Args:
        tythe_width: Width in px for Tythe logo.
        kari_width: Width in px for Kari logo.
        layout: "stacked" (Tythe above Kari) or "side" (Tythe left, Kari right).
    """
    tythe_ok = _TYTHE_PATH.exists()
    kari_ok = _KARI_PATH.exists()

    if not tythe_ok and not kari_ok:
        return

    if layout == "stacked":
        col1, col2, col3 = st.columns([1, 2, 1])
        with col2:
            if tythe_ok:
                st.image(str(_TYTHE_PATH), width=tythe_width)
            if kari_ok:
                st.image(str(_KARI_PATH), width=kari_width)
    else:
        col1, col2, col3 = st.columns([2, 1, 2])
        with col2:
            if tythe_ok:
                st.image(str(_TYTHE_PATH), width=tythe_width)
            if kari_ok:
                st.image(str(_KARI_PATH), width=kari_width)
