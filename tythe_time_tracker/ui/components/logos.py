"""Logo display component: Tythe (primary) and Kari (secondary)."""

import base64
from pathlib import Path

import streamlit as st

_STATIC = Path(__file__).resolve().parent.parent.parent / "static"
_TYTHE_PATH = _STATIC / "tythe-logo.png"
_KARI_PATH = _STATIC / "kari-logo.png"


def _image_data_uri(path: Path) -> str:
    """Return a data URI for an image file."""
    suffix = path.suffix.lower()
    mime_type = "image/png" if suffix == ".png" else "image/jpeg"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def render_tythe_only(width: int = 200) -> None:
    """Render only the Tythe logo (e.g. for login page top)."""
    if not _TYTHE_PATH.exists():
        return
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.image(str(_TYTHE_PATH), width=width)


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

    layout_class = "tt-logos--side" if layout == "side" else "tt-logos--stacked"
    html_parts = [
        """
        <style>
        .tt-logos {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
            margin: 0 auto;
            text-align: center;
        }
        .tt-logos--stacked {
            flex-direction: column;
            gap: 0.45rem;
        }
        .tt-logos--side {
            flex-direction: row;
            gap: 0.9rem;
            flex-wrap: wrap;
        }
        .tt-logos img {
            display: block;
            height: auto;
            max-width: 100%;
        }
        .tt-logos__tythe {
            filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.05));
        }
        .tt-logos__kari {
            opacity: 0.95;
        }
        @media (max-width: 640px) {
            .tt-logos--side {
                flex-direction: column;
                gap: 0.5rem;
            }
        }
        </style>
        """,
        f'<div class="tt-logos {layout_class}" aria-label="Tythe and Kari Suite logos">',
    ]

    if tythe_ok:
        html_parts.append(
            (
                f'<img class="tt-logos__tythe" src="{_image_data_uri(_TYTHE_PATH)}" '
                f'alt="Tythe Barn" style="width:{tythe_width}px;">'
            )
        )
    if kari_ok:
        html_parts.append(
            (
                f'<img class="tt-logos__kari" src="{_image_data_uri(_KARI_PATH)}" '
                f'alt="Kari Suite" style="width:{kari_width}px;">'
            )
        )

    html_parts.append("</div>")
    st.markdown("".join(html_parts), unsafe_allow_html=True)
