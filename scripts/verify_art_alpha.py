#!/usr/bin/env python3
"""Fail if playable sprites still have an opaque studio plate."""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from process_art_alpha import ART, border_light_mask, is_near_black, is_neutral_plate

MAX_BACKDROP_FRAC = 0.005


def check(path: Path) -> list[str]:
    errors: list[str] = []
    im = Image.open(path)
    if im.mode != "RGBA":
        errors.append(f"{path.name}: mode is {im.mode}, expected RGBA")
        return errors
    w, h = im.size
    corners = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    for x, y in corners:
        r, g, b, a = im.getpixel((x, y))
        if a > 12 and (is_neutral_plate((r, g, b)) or is_near_black((r, g, b))):
            errors.append(
                f"{path.name}: opaque backdrop at corner ({x},{y}) a={a} rgb=({r},{g},{b})"
            )
    bg = border_light_mask(im.convert("RGBA"))
    frac = len(bg) / float(w * h)
    if frac > MAX_BACKDROP_FRAC:
        errors.append(
            f"{path.name}: border-connected light backdrop {len(bg)}px "
            f"({frac * 100:.2f}% > {MAX_BACKDROP_FRAC * 100:.2f}%)"
        )
    return errors


def main() -> int:
    files = sorted(ART.rglob("*.png"))
    if not files:
        print("FAIL: no PNGs in", ART, file=sys.stderr)
        return 1
    all_errors: list[str] = []
    for path in files:
        all_errors.extend(check(path))
    if all_errors:
        print("FAIL: white/opaque backdrop checks")
        for e in all_errors:
            print(" -", e)
        return 1
    print(f"OK  verified {len(files)} art PNGs (backgrounds transparent)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
