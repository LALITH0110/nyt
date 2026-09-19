#!/usr/bin/env python3
"""
Fill a crossword grid, preferring a list of personal words.

    python3 tools/build-crossword.py mini
    python3 tools/build-crossword.py crossword
    python3 tools/build-crossword.py mini --count 10

Edit PATTERNS and PREFERRED below. "#" is a black square, "." is open.
Prints filled grids; paste the one you like into data/puzzles.js and write
clues for it.
"""
import random, sys, itertools
from collections import defaultdict

PATTERNS = {
    # 5x5 staircase: one five-letter entry each way, the rest shorter, which
    # leaves enough freedom to place a chosen word.
    "mini": [
        "...##",
        "....#",
        ".....",
        "#....",
        "##...",
    ],
    # 5x5 tight: every row and column a word. Hard to place personal words in.
    "mini-tight": [
        "....#",
        ".....",
        ".....",
        ".....",
        "#....",
    ],
    # 7x7: rows 2 and 4 are full seven-letter entries
    "crossword": [
        "...#...",
        "...#...",
        ".......",
        "##...##",
        ".......",
        "...#...",
        "...#...",
    ],
}

# Words we would like to see in the grid, longest first is fine.
PREFERRED = """
IIT BORS REBA BECKS BEXIE BECCA TINLEY REBECCA
PEONIES CARROTS CARROT PEACOCK VELLORE TIRAMISU MANGOES BANANAS SAMOSAS
CORN ROSE MANGO MOCHA DYSON MARCH PEONY LILAC CAKES LATTE MINT PINK BLUE
LOVE KISS HUG CUTE SMILE HEART DATE MINE YOURS ALWAYS FOREVER SWEET HONEY
DEAR BABY TREAT CREAM NAME CALL TEXT GIFT CAKE RING WIFE GIRL BEST LUCKY
HAPPY DESTINY PROMISE PERFECT DARLING SWEETIE TOGETHER LAUGH DREAM
"""

# Fill words we never want to see (add anything obscure the filler picks).
BANNED = set("""
ABAS ABAC ALOD ALOE ALEE ANAS ANOA ARAR ASEA AVAS AWA AAL AALS ABB ABY
ESNE ETEN ERNE EWER OBOL OLEO OTTO SESE SESS TETE TOTE
ANA ANN AVE AYE DAS DEE DIV DOD DOM GEN GEO IST KAI LAN LAS LEU MAE MAS
NEO NON PEE RIO SAO SEN SOC SRI TED PETE ALT ETC INC LTD VIA VOL DEC NOV
OCT JAN FEB APR JUL AUG SEP PHD USA USB FAQ URL WWW HTTP PDF JPG XML PAC PSI SUR TRI LEE REF PRO
TEE ITS
""".split())


import os
HERE = os.path.dirname(os.path.abspath(__file__))

def load_words():
    """Common words only. A crossword is no fun if the fill is full of words
    nobody can write a clue for, so this deliberately ignores the big system
    dictionary and uses the curated frequency list next door."""
    words = set()
    with open(os.path.join(HERE, "common-words.txt")) as f:
        for line in f:
            w = line.strip()
            if w and not w.startswith("#"):
                words.add(w.upper())
    words |= set(PREFERRED.split())
    return {w for w in words if w not in BANNED}


def find_slots(pattern):
    R, C = len(pattern), len(pattern[0])
    blk = lambda r, c: pattern[r][c] == "#"
    slots = []
    for r in range(R):
        c = 0
        while c < C:
            if blk(r, c): c += 1; continue
            start = c
            while c < C and not blk(r, c): c += 1
            if c - start >= 2:
                slots.append(("A", [(r, x) for x in range(start, c)]))
    for c in range(C):
        r = 0
        while r < R:
            if blk(r, c): r += 1; continue
            start = r
            while r < R and not blk(r, c): r += 1
            if r - start >= 2:
                slots.append(("D", [(x, c) for x in range(start, r)]))
    return slots


def fill(pattern, words, preferred, rng, want=1, tries=200000, seed_words=()):
    """seed_words: (word, slot_index) pairs forced into the grid first, so the
    personal words actually survive instead of being backtracked away."""
    slots = find_slots(pattern)
    by_len = defaultdict(list)
    for w in words:
        by_len[len(w)].append(w)

    # index: (length, position, letter) -> set of words
    idx = defaultdict(set)
    for L, ws in by_len.items():
        for w in ws:
            for i, ch in enumerate(w):
                idx[(L, i, ch)].add(w)

    cell = {}          # (r,c) -> letter
    used = set()
    results = []
    budget = [tries]

    def candidates(slot):
        _, cells = slot
        L = len(cells)
        fixed = [(i, cell[p]) for i, p in enumerate(cells) if p in cell]
        if not fixed:
            return by_len[L]
        sets = [idx.get((L, i, ch), set()) for i, ch in fixed]
        sets.sort(key=len)
        out = set(sets[0])
        for s in sets[1:]:
            out &= s
            if not out: break
        return out

    def rec(remaining):
        if budget[0] <= 0: return
        budget[0] -= 1
        if not remaining:
            results.append({k: v for k, v in cell.items()})
            return
        # most-constrained slot first
        scored = []
        for s in remaining:
            c = candidates(s)
            if not c: return
            scored.append((len(c), s, c))
        scored.sort(key=lambda x: x[0])
        _, slot, cands = scored[0]
        rest = [s for s in remaining if s is not slot]
        _, cells = slot

        cands = [w for w in cands if w not in used]
        pref = [w for w in cands if w in preferred]
        other = [w for w in cands if w not in preferred]
        rng.shuffle(pref); rng.shuffle(other)
        for w in pref + other:
            written = []
            bad = False
            for i, p in enumerate(cells):
                if p in cell:
                    if cell[p] != w[i]: bad = True; break
                else:
                    cell[p] = w[i]; written.append(p)
            if not bad:
                used.add(w)
                rec(rest)
                used.discard(w)
            for p in written: del cell[p]
            if len(results) >= want or budget[0] <= 0: return

    # Force the seeded words in before filling anything else.
    forced = []
    for w, si in seed_words:
        _, cells = slots[si]
        if len(w) != len(cells): return [], slots
        for i, pnt in enumerate(cells):
            if pnt in cell and cell[pnt] != w[i]: return [], slots
            if pnt not in cell:
                cell[pnt] = w[i]; forced.append(pnt)
        used.add(w)
    seeded = {si for _, si in seed_words}
    rec([s for i, s in enumerate(slots) if i not in seeded])
    for pnt in forced: del cell[pnt]
    return results, slots


def render(pattern, sol):
    R, C = len(pattern), len(pattern[0])
    return ["".join("#" if pattern[r][c] == "#" else sol[(r, c)]
                    for c in range(C)) for r in range(R)]


def entries(pattern, grid):
    """Numbered across/down entries, exactly as the game numbers them."""
    R, C = len(pattern), len(pattern[0])
    blk = lambda r, c: pattern[r][c] == "#"
    n = 0
    out = {"across": [], "down": []}
    for r in range(R):
        for c in range(C):
            if blk(r, c): continue
            sa = (c == 0 or blk(r, c-1)) and (c+1 < C and not blk(r, c+1))
            sd = (r == 0 or blk(r-1, c)) and (r+1 < R and not blk(r+1, c))
            if not (sa or sd): continue
            n += 1
            if sa:
                w = ""; cc = c
                while cc < C and not blk(r, cc): w += grid[r][cc]; cc += 1
                out["across"].append((n, w))
            if sd:
                w = ""; rr = r
                while rr < R and not blk(rr, c): w += grid[rr][c]; rr += 1
                out["down"].append((n, w))
    return out


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "mini"
    count = 6
    if "--count" in sys.argv:
        count = int(sys.argv[sys.argv.index("--count") + 1])
    if which not in PATTERNS:
        print("choose one of:", ", ".join(PATTERNS)); sys.exit(1)

    pattern = PATTERNS[which]
    words = load_words()
    preferred = set(PREFERRED.split())
    rng = random.Random()

    slots = find_slots(pattern)
    # every (personal word, slot) pairing that fits by length
    pairings = [(w, i) for w in sorted(preferred)
                for i, (_, cells) in enumerate(slots) if len(w) == len(cells)]
    rng.shuffle(pairings)

    shown = 0
    seen_grids = set()
    for attempt, (word, si) in enumerate(pairings * 4):
        if shown >= count: break
        rng.seed(attempt)
        sols, _ = fill(pattern, words, preferred, rng, want=1, tries=40000,
                       seed_words=[(word, si)])
        if not sols: continue
        grid = render(pattern, sols[0])
        key = tuple(grid)
        if key in seen_grids: continue
        seen_grids.add(key)
        ent = entries(pattern, grid)
        allw = [w for _, w in ent["across"]] + [w for _, w in ent["down"]]
        hits = sorted({w for w in allw if w in preferred})
        shown += 1
        print(f"--- option {shown} (seeded with {word}), personal words: "
              f"{', '.join(hits) if hits else 'none'}")
        for row in grid:
            print("      " + " ".join(row))
        print("      across: " + ", ".join(f"{n}:{w}" for n, w in ent["across"]))
        print("      down:   " + ", ".join(f"{n}:{w}" for n, w in ent["down"]))
        print()


if __name__ == "__main__":
    main()
