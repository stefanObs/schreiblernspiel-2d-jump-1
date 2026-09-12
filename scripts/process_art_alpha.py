#!/usr/bin/env python3
"""Strip AI white/gray/black plates from Style-C sprites.

Preserves #1A1A1A outlines: near-black is only removed when farther than
OUTLINE_KEEP_RADIUS from cel fills (so thick strokes are not flooded away
with a black studio plate).
"""
from __future__ import annotations

import sys
from collections import deque
from pathlib import Path

from PIL import Image

ART = Path(__file__).resolve().parents[1] / "public" / "art"
## Neutral AI plates: white, light gray, and checkerboard grays (not Style-C outlines).
BACKDROP_CHROMA_MAX = 22
BLACK_MAX = 28
PAD = 8
SPECKLE_EMPTY = 5
## Keep near-black within this Chebyshev distance of cel fills (Style-C outlines
## are often 5–12px; the old "touch content + 1px grow" ate thick strokes).
OUTLINE_KEEP_RADIUS = 18


def is_neutral_plate(px: tuple[int, ...]) -> bool:
    """Gray/white studio plate or checkerboard tile — not black outline, not cel color."""
    r, g, b = int(px[0]), int(px[1]), int(px[2])
    if max(r, g, b) - min(r, g, b) > BACKDROP_CHROMA_MAX:
        return False
    if max(r, g, b) <= BLACK_MAX:
        return False
    return True


def is_light_backdrop(px: tuple[int, ...], threshold: int = 218) -> bool:
    """Backward-compatible alias used by verify_art_alpha."""
    r, g, b = int(px[0]), int(px[1]), int(px[2])
    if r < threshold or g < threshold or b < threshold:
        return False
    return max(r, g, b) - min(r, g, b) <= BACKDROP_CHROMA_MAX


def is_near_black(px: tuple[int, ...], max_v: int = BLACK_MAX) -> bool:
    return max(int(px[0]), int(px[1]), int(px[2])) <= max_v


def is_hardware_metal(px: tuple[int, ...]) -> bool:
    """Mid-gray bolts/nails: low chroma, not black outline, not white plate."""
    a = int(px[3]) if len(px) > 3 else 255
    if a < 8:
        return False
    r, g, b = int(px[0]), int(px[1]), int(px[2])
    mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn > BACKDROP_CHROMA_MAX:
        return False
    return 70 <= mx <= 170


def is_content_color(px: tuple[int, ...]) -> bool:
    a = int(px[3]) if len(px) > 3 else 255
    if a < 8:
        return False
    # Bolts must count as content so #1A1A1A rings around them are kept.
    if is_hardware_metal(px):
        return True
    if is_near_black(px) or is_neutral_plate(px):
        return False
    return True


def _alpha(px: tuple[int, ...]) -> int:
    return int(px[3]) if len(px) > 3 else 255


def _neighbors8(x: int, y: int) -> tuple[tuple[int, int], ...]:
    return (
        (x - 1, y),
        (x + 1, y),
        (x, y - 1),
        (x, y + 1),
        (x - 1, y - 1),
        (x + 1, y - 1),
        (x - 1, y + 1),
        (x + 1, y + 1),
    )


def border_light_mask(im: Image.Image) -> set[tuple[int, int]]:
    """Neutral plate (white/gray/checker) reachable from the border via empty or plate."""
    w, h = im.size
    px = im.load()
    visited: set[tuple[int, int]] = set()
    found: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()

    def walkable(p: tuple[int, ...]) -> bool:
        return _alpha(p) < 8 or is_neutral_plate(p)

    def try_push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and (x, y) not in visited and walkable(px[x, y]):
            visited.add((x, y))
            q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        if is_neutral_plate(px[x, y]) and _alpha(px[x, y]) >= 8:
            found.add((x, y))
        try_push(x - 1, y)
        try_push(x + 1, y)
        try_push(x, y - 1)
        try_push(x, y + 1)
    return found


def near_content_mask(im: Image.Image, radius: int = OUTLINE_KEEP_RADIUS) -> set[tuple[int, int]]:
    """Pixels within Chebyshev distance `radius` of any cel-fill (non-black, non-plate)."""
    w, h = im.size
    px = im.load()
    dist = [[-1] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for y in range(h):
        for x in range(w):
            if is_content_color(px[x, y]):
                dist[y][x] = 0
                q.append((x, y))
    while q:
        x, y = q.popleft()
        d = dist[y][x]
        if d >= radius:
            continue
        for nx, ny in _neighbors8(x, y):
            if 0 <= nx < w and 0 <= ny < h and dist[ny][nx] < 0:
                dist[ny][nx] = d + 1
                q.append((nx, ny))
    return {(x, y) for y in range(h) for x in range(w) if 0 <= dist[y][x] <= radius}


def border_black_mask(im: Image.Image) -> set[tuple[int, int]]:
    """Near-black border flood, keeping strokes near cel fills (Style-C outlines).

    AI black plates connect to outlines via flood-fill. Only remove plate pixels
    that are farther than OUTLINE_KEEP_RADIUS from any content color — never strip
    thick #1A1A1A outlines just because they touch the plate.
    """
    w, h = im.size
    px = im.load()
    visited: set[tuple[int, int]] = set()
    q: deque[tuple[int, int]] = deque()

    def try_push(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and (x, y) not in visited:
            p = px[x, y]
            if _alpha(p) >= 8 and is_near_black(p):
                visited.add((x, y))
                q.append((x, y))

    for x in range(w):
        try_push(x, 0)
        try_push(x, h - 1)
    for y in range(h):
        try_push(0, y)
        try_push(w - 1, y)

    while q:
        x, y = q.popleft()
        try_push(x - 1, y)
        try_push(x + 1, y)
        try_push(x, y - 1)
        try_push(x, y + 1)

    protect = near_content_mask(im, OUTLINE_KEEP_RADIUS)
    return visited - protect


def speckle_mask(im: Image.Image, already: set[tuple[int, int]]) -> set[tuple[int, int]]:
    """Punch leftover light/gray plate dots in empty space. Never touches near-black
    (outlines / joints) — those are handled only by border_black / enclosed_thick_black.
    """
    w, h = im.size
    px = im.load()
    extra: set[tuple[int, int]] = set()
    for y in range(h):
        for x in range(w):
            if (x, y) in already:
                continue
            p = px[x, y]
            if _alpha(p) < 8 or not is_neutral_plate(p):
                continue
            empty = 0
            for nx, ny in _neighbors8(x, y):
                if not (0 <= nx < w and 0 <= ny < h) or (nx, ny) in already:
                    empty += 1
                    continue
                if _alpha(px[nx, ny]) < 8:
                    empty += 1
            if empty >= SPECKLE_EMPTY:
                extra.add((x, y))
    return extra


def _is_outlined_fill(
    component: list[tuple[int, int]],
    component_set: set[tuple[int, int]],
    px,
    w: int,
    h: int,
) -> bool:
    """True for intentional bright fills (e.g. white chest panel) rimmed by black outline."""
    black = 0
    other = 0
    for x, y in component:
        for nx, ny in _neighbors8(x, y):
            if (nx, ny) in component_set:
                continue
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            n = px[nx, ny]
            if _alpha(n) < 8:
                continue
            if is_near_black(n):
                black += 1
            else:
                other += 1
    return black >= max(1, other)


def enclosed_neutral_mask(
    im: Image.Image, *, keep_outlined_fills: bool = True
) -> set[tuple[int, int]]:
    """Remove enclosed gray/white holes (rail gaps, tree crotches); keep outlined white fills."""
    w, h = im.size
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    remove: set[tuple[int, int]] = set()

    for y0 in range(h):
        for x0 in range(w):
            if seen[y0][x0]:
                continue
            p0 = px[x0, y0]
            if _alpha(p0) < 8 or not is_neutral_plate(p0):
                seen[y0][x0] = True
                continue
            # Hardware bolts are neutral-chroma but must stay.
            if is_hardware_metal(p0):
                seen[y0][x0] = True
                continue
            q: deque[tuple[int, int]] = deque([(x0, y0)])
            seen[y0][x0] = True
            component: list[tuple[int, int]] = []
            touches_border = False
            while q:
                x, y = q.popleft()
                component.append((x, y))
                if x == 0 or y == 0 or x == w - 1 or y == h - 1:
                    touches_border = True
                for nx, ny in _neighbors8(x, y):
                    if not (0 <= nx < w and 0 <= ny < h):
                        touches_border = True
                        continue
                    if seen[ny][nx]:
                        continue
                    n = px[nx, ny]
                    if _alpha(n) >= 8 and is_neutral_plate(n) and not is_hardware_metal(n):
                        seen[ny][nx] = True
                        q.append((nx, ny))
            if touches_border:
                continue
            component_set = set(component)
            if keep_outlined_fills and _is_outlined_fill(
                component, component_set, px, w, h
            ):
                continue
            remove.update(component)
    return remove


def enclosed_thick_black_mask(
    im: Image.Image, y_max_frac: float | None = None
) -> set[tuple[int, int]]:
    """Remove enclosed near-black voids (e.g. bridge rail gaps), keep thin outlines."""
    w, h = im.size
    y_limit = h if y_max_frac is None else int(h * y_max_frac)
    px = im.load()
    seen = [[False] * w for _ in range(h)]
    remove: set[tuple[int, int]] = set()

    for y0 in range(min(h, y_limit)):
        for x0 in range(w):
            if seen[y0][x0]:
                continue
            p0 = px[x0, y0]
            if _alpha(p0) < 8 or not is_near_black(p0):
                seen[y0][x0] = True
                continue
            q: deque[tuple[int, int]] = deque([(x0, y0)])
            seen[y0][x0] = True
            component: list[tuple[int, int]] = []
            touches_border = False
            while q:
                x, y = q.popleft()
                component.append((x, y))
                if x == 0 or y == 0 or x == w - 1 or y == h - 1:
                    touches_border = True
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if not (0 <= nx < w and 0 <= ny < h):
                        touches_border = True
                        continue
                    if seen[ny][nx]:
                        continue
                    if ny >= y_limit:
                        continue
                    n = px[nx, ny]
                    if _alpha(n) >= 8 and is_near_black(n):
                        seen[ny][nx] = True
                        q.append((nx, ny))
            if touches_border or len(component) < 60:
                continue
            component_set = set(component)
            interior = 0
            for x, y in component:
                ncount = 0
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if (nx, ny) in component_set:
                        ncount += 1
                if ncount == 4:
                    interior += 1
            if interior / len(component) >= 0.12:
                remove.update(component)
    return remove


def fill_bridge_plank_caulk(im: Image.Image) -> None:
    """Paint opaque black between walkway planks (rail gaps stay transparent)."""
    w, h = im.size
    px = im.load()
    y0, y1 = int(h * 0.45), int(h * 0.80)
    caulk = (8, 6, 5, 255)

    def has_structure(x: int, y: int, direction: int, dist: int = 10) -> bool:
        step = 1 if direction > 0 else -1
        for d in range(1, dist + 1):
            xx = x + step * d
            if not (0 <= xx < w):
                return False
            p = px[xx, y]
            if p[3] < 8:
                continue
            if is_content_color(p):
                return True
            # bolts / gray hardware still count as structure
            if abs(int(p[0]) - int(p[1])) < 25 and int(p[0]) > 40 and max(p[0], p[1], p[2]) > 50:
                return True
        return False

    for y in range(y0, y1):
        for x in range(w):
            r, g, b, a = px[x, y]
            candidate = a < 8 or (a >= 8 and max(r, g, b) <= 55)
            if not candidate:
                continue
            if not (has_structure(x, y, -1) and has_structure(x, y, 1)):
                continue
            for xx in range(max(0, x - 1), min(w, x + 2)):
                rr, gg, bb, aa = px[xx, y]
                if aa < 8 or max(rr, gg, bb) <= 90:
                    px[xx, y] = caulk


def _bridge_structure_dist(im: Image.Image, y_limit: int) -> list[list[int]]:
    """Chebyshev distance to wood/hardware in the railing band."""
    w, h = im.size
    px = im.load()
    inf = 10**9
    dist = [[inf] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    for y in range(min(h, y_limit)):
        for x in range(w):
            if is_content_color(px[x, y]):
                dist[y][x] = 0
                q.append((x, y))
    while q:
        x, y = q.popleft()
        d = dist[y][x]
        if d >= 24:
            continue
        for nx, ny in _neighbors8(x, y):
            if 0 <= nx < w and 0 <= ny < y_limit and dist[ny][nx] > d + 1:
                dist[ny][nx] = d + 1
                q.append((nx, ny))
    return dist


def seal_bridge_nail_halos(im: Image.Image) -> None:
    """Fill transparent rings between gray bolts and wood/outline with #1A1A1A."""
    w, h = im.size
    px = im.load()
    outline = (26, 26, 26, 255)
    y_limit = int(h * 0.55)

    pts = [
        (x, y)
        for y in range(y_limit)
        for x in range(w)
        if is_hardware_metal(px[x, y])
    ]
    seen: set[tuple[int, int]] = set()
    nails: list[tuple[int, int, int, list[tuple[int, int]]]] = []
    for p0 in pts:
        if p0 in seen:
            continue
        q: deque[tuple[int, int]] = deque([p0])
        seen.add(p0)
        comp: list[tuple[int, int]] = []
        while q:
            x, y = q.popleft()
            comp.append((x, y))
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                n = (nx, ny)
                if n in seen or not (0 <= nx < w and 0 <= ny < y_limit):
                    continue
                if is_hardware_metal(px[nx, ny]):
                    seen.add(n)
                    q.append(n)
        if not (120 <= len(comp) <= 1800):
            continue
        xs = [p[0] for p in comp]
        ys = [p[1] for p in comp]
        bw = max(xs) - min(xs) + 1
        bh = max(ys) - min(ys) + 1
        if bw < 12 or bh < 12 or abs(bw - bh) > max(bw, bh) * 0.55:
            continue
        if max(bw, bh) > 70:
            continue
        cx = sum(xs) // len(xs)
        cy = sum(ys) // len(ys)
        rad = max(max(abs(x - cx), abs(y - cy)) for x, y in comp) + 1
        nails.append((cx, cy, rad, comp))

    for cx, cy, rad, comp in nails:
        # Seal any transparent pixel within Chebyshev distance 6 of the bolt.
        for x, y in comp:
            for dy in range(-6, 7):
                for dx in range(-6, 7):
                    xx, yy = x + dx, y + dy
                    if not (0 <= xx < w and 0 <= yy < h):
                        continue
                    r, g, b, a = px[xx, yy]
                    if a < 40:
                        px[xx, yy] = outline
                    elif (
                        a > 200
                        and is_neutral_plate((r, g, b))
                        and not is_hardware_metal((r, g, b, a))
                    ):
                        px[xx, yy] = outline


def thin_bridge_rail_outlines(im: Image.Image, keep: int = 5) -> None:
    """Erode oversized black frames around transparent rail windows down to ~keep px."""
    w, h = im.size
    px = im.load()
    y_limit = int(h * 0.48)
    dist = _bridge_structure_dist(im, y_limit)
    # Multi-pass erode: black touching a transparent rail gap and far from wood.
    for _ in range(14):
        doomed: list[tuple[int, int]] = []
        for y in range(y_limit):
            for x in range(w):
                p = px[x, y]
                if _alpha(p) < 8 or not is_near_black(p):
                    continue
                if dist[y][x] <= keep:
                    continue
                touches_gap = False
                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if 0 <= nx < w and 0 <= ny < h and _alpha(px[nx, ny]) < 8:
                        touches_gap = True
                        break
                if touches_gap:
                    doomed.append((x, y))
        if not doomed:
            break
        for x, y in doomed:
            r, g, b, _a = px[x, y]
            px[x, y] = (r, g, b, 0)


def clear_bridge_rail_white(im: Image.Image) -> None:
    """Force-clear leftover white/gray plate in the railing band (not bolts)."""
    w, h = im.size
    px = im.load()
    y_limit = int(h * 0.50)
    for y in range(y_limit):
        for x in range(w):
            p = px[x, y]
            if _alpha(p) < 8 or is_hardware_metal(p):
                continue
            r, g, b, a = int(p[0]), int(p[1]), int(p[2]), int(p[3])
            if is_neutral_plate(p) or (
                a > 200 and min(r, g, b) >= 150 and max(r, g, b) - min(r, g, b) <= 40
            ):
                px[x, y] = (r, g, b, 0)


def process(path: Path) -> None:
    im = Image.open(path).convert("RGBA")
    bg = border_light_mask(im) | border_black_mask(im)
    bg |= speckle_mask(im, bg)
    # Bridge rail “windows” are often white rectangles with black rims — those must
    # be punched even though they look like outlined fills.
    if path.name == "prop_bridge.png":
        bg |= enclosed_neutral_mask(im, keep_outlined_fills=False)
        bg |= enclosed_thick_black_mask(im, y_max_frac=0.48)
    else:
        bg |= enclosed_neutral_mask(im)
    px = im.load()
    w, h = im.size

    for x, y in bg:
        r, g, b, _a = px[x, y]
        px[x, y] = (r, g, b, 0)

    for x, y in list(bg):
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if not (0 <= nx < w and 0 <= ny < h):
                continue
            if (nx, ny) in bg:
                continue
            r, g, b, a = px[nx, ny]
            if is_neutral_plate((r, g, b)) and a > 64 and not is_hardware_metal((r, g, b, a)):
                px[nx, ny] = (r, g, b, 0)

    # Second pass: after black plate is gone, gray fringes may newly reach the border.
    for _ in range(2):
        extra = border_light_mask(im) | speckle_mask(im, set())
        # Never strip mid-gray bolts during fringe cleanup.
        extra = {p for p in extra if not is_hardware_metal(im.getpixel(p))}
        if not extra:
            break
        px = im.load()
        for x, y in extra:
            r, g, b, _a = px[x, y]
            px[x, y] = (r, g, b, 0)

    if path.name == "prop_bridge.png":
        clear_bridge_rail_white(im)
        thin_bridge_rail_outlines(im, keep=4)
        fill_bridge_plank_caulk(im)
        # Seal bolt rings after all other edits (thinning can leave holes).
        seal_bridge_nail_halos(im)
        seal_bridge_nail_halos(im)

    bbox = im.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        left = max(0, left - PAD)
        top = max(0, top - PAD)
        right = min(w, right + PAD)
        bottom = min(h, bottom + PAD)
        im = im.crop((left, top, right, bottom))

    if path.name == "prop_bridge.png":
        seal_bridge_nail_halos(im)

    im.save(path, "PNG", optimize=True)
    print(f"OK  {path.name} -> {im.size[0]}x{im.size[1]} mode={im.mode}")


def main() -> int:
    files = sorted(ART.rglob("*.png"))
    if not files:
        print("No PNGs in", ART, file=sys.stderr)
        return 1
    for path in files:
        process(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
