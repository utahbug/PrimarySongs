from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
MUSIC_DIR = ROOT / "music" / "Primary-2026"
OUTPUT = ROOT / "lyrics-cards.js"

CARDS = [
    ("called-to-serve-lyrics-249.pdf", "lyrics-card-called-to-serve-249", "Called to Serve - Lyrics", "called-to-serve-lyrics-249"),
    ("choose-to-serve-the-lord-lyrics.pdf", "lyrics-card-choose-to-serve-the-lord", "Choose to Serve the Lord - Lyrics", "choose-to-serve-the-lord-lyrics"),
    ("i-feel-my-savior-s-love-lyrics-74.pdf", "lyrics-card-i-feel-my-saviors-love-74", "I Feel My Savior's Love - Lyrics", "i-feel-my-savior-s-love-lyrics-74"),
    ("i-will-follow-god-s-plan-lyrics-165.pdf", "lyrics-card-i-will-follow-gods-plan-165", "I Will Follow God's Plan - Lyrics", "i-will-follow-god-s-plan-lyrics-165"),
    ("i-will-walk-with-jesus-1004-lyrics.pdf", "lyrics-card-i-will-walk-with-jesus-1004", "I Will Walk with Jesus - Lyrics", "i-will-walk-with-jesus-1004-lyrics"),
    ("search-ponder-and-pray-lyrics-109.pdf", "lyrics-card-search-ponder-and-pray-109", "Search, Ponder, and Pray - Lyrics", "search-ponder-and-pray-lyrics-109"),
    ("the-wise-man-and-the-foolish-man-lyrics-281.pdf", "lyrics-card-wise-man-foolish-man-281", "The Wise Man and the Foolish Man - Lyrics", "the-wise-man-and-the-foolish-man-lyrics-281"),
    ("this-little-light-of-mine-lyrics-1028.pdf", "lyrics-card-this-little-light-of-mine-1028", "This Little Light of Mine - Lyrics", "this-little-light-of-mine-lyrics-1028"),
]


def extract_text(path: Path) -> str:
    with pdfplumber.open(path) as pdf:
        text = "\n".join(page.extract_text(x_tolerance=2, y_tolerance=3) or "" for page in pdf.pages)
    lines = [line.strip() for line in text.splitlines()]
    lines = lines[1:]  # Drop the PDF title; the Card supplies a responsive title.
    lines = [line for line in lines if line not in {"About this hymn", "See also Hymns, no. 249."}]
    text = "\n".join(lines).strip()
    text = re.sub(r"(?m)^(\d+)\.(?=\S)", r"\1. ", text)
    text = text.replace("within my heart-\n", "within my heart—\n")
    return text


cards = [
    {
        "id": card_id,
        "title": title,
        "type": "card",
        "category": "Primary Songs 2026",
        "lyricsCard": True,
        "sourcePdfId": source_pdf_id,
        "lyricsText": extract_text(MUSIC_DIR / filename),
    }
    for filename, card_id, title, source_pdf_id in CARDS
]

lists = [
    {
        "id": "primary-program-lyrics-cards",
        "title": "Primary Program - Lyrics Cards",
        "showCheckboxes": False,
        "items": [
            {"itemId": "lyrics-card-this-little-light-of-mine-1028"},
            {"itemId": "lyrics-card-called-to-serve-249"},
            {"itemId": "lyrics-card-i-will-follow-gods-plan-165"},
        ],
    },
    {
        "id": "primary-songs-2026-lyrics-cards",
        "title": "Primary Songs 2026 - Lyrics Cards",
        "showCheckboxes": False,
        "items": [
            {"itemId": "lyrics-card-choose-to-serve-the-lord"},
            {"itemId": "lyrics-card-search-ponder-and-pray-109"},
            {"itemId": "lyrics-card-wise-man-foolish-man-281"},
            {"itemId": "lyrics-card-i-will-walk-with-jesus-1004"},
            {"itemId": "lyrics-card-i-feel-my-saviors-love-74"},
            {"itemId": "lyrics-card-this-little-light-of-mine-1028"},
        ],
    },
]

OUTPUT.write_text(
    '"use strict";\n\n'
    "// Generated from the repository's lyric PDFs. Device-local edits remain private.\n"
    f"window.PRIMARY_LYRIC_CARDS = {json.dumps(cards, ensure_ascii=False, indent=2)};\n\n"
    f"window.PRIMARY_LYRIC_LISTS = {json.dumps(lists, ensure_ascii=False, indent=2)};\n",
    encoding="utf-8",
)
