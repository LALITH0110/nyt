#!/usr/bin/env python3
"""
Build a new Threads grid.

Edit WORDS and SPANGRAM below, then run:

    python3 tools/build-strands.py

It prints a block you paste over `strands:` in data/puzzles.js.

The catch: the letters of your words must add up to exactly ROWS x COLS, because
every square on the board has to belong to one word. With the default 8x6 board
that's 48 letters. The script tells you if your list doesn't add up.
"""
import random, sys, time

ROWS, COLS = 8, 6
THEME    = "Sweet nothings"
CLUE     = "What I call you."
WORDS    = ["SWEETIE", "DARLING", "HONEY", "ANGEL", "CUTIE", "ADORE", "BABY", "DEAR"]
SPANGRAM = "MYLOVE"

# ---------------------------------------------------------------------------

N = ROWS * COLS
DIRS = [(-1,-1),(-1,0),(-1,1),(0,-1),(0,1),(1,-1),(1,0),(1,1)]
NBR = []
for r in range(ROWS):
    for c in range(COLS):
        NBR.append([(r+dr)*COLS + (c+dc) for dr, dc in DIRS
                    if 0 <= r+dr < ROWS and 0 <= c+dc < COLS])

def feasible(empty, lengths):
    """Prune: every empty pocket must be fillable by some subset of the
    remaining words, so its size must be an achievable subset sum."""
    reach = 1
    for L in lengths:
        reach |= reach << L
    seen = set()
    for cell in empty:
        if cell in seen: continue
        stack, size = [cell], 0
        seen.add(cell)
        while stack:
            x = stack.pop(); size += 1
            for y in NBR[x]:
                if y in empty and y not in seen:
                    seen.add(y); stack.append(y)
        if not (reach >> size) & 1:
            return False
    return True

def paths_from(start, need, empty, used, rng, cap):
    out = []
    def dfs(cur, path):
        if len(out) >= cap: return
        if len(path) == need:
            out.append(list(path)); return
        ns = [n for n in NBR[cur] if n in empty and n not in used and n not in path]
        rng.shuffle(ns)
        for n in ns:
            path.append(n); dfs(n, path); path.pop()
            if len(out) >= cap: return
    if need == 0: return [[]]
    dfs(start, [])
    return out

def placements(word, anchor, empty, rng, cap=24):
    """Paths spelling `word` that pass through `anchor` at some index."""
    res = []
    idxs = list(range(len(word))); rng.shuffle(idxs)
    for p in idxs:
        for f in paths_from(anchor, len(word)-1-p, empty, {anchor}, rng, cap):
            used = {anchor} | set(f)
            for b in paths_from(anchor, p, empty, used, rng, cap):
                res.append(list(reversed(b)) + [anchor] + f)
                if len(res) >= cap: return res
    return res

def spans(path):
    rs = [x // COLS for x in path]; cs = [x % COLS for x in path]
    return (0 in rs and ROWS-1 in rs) or (0 in cs and COLS-1 in cs)

def attempt(rng, deadline):
    grid = [None]*N
    empty = set(range(N))
    placed = {}
    order = WORDS[:]; rng.shuffle(order)

    sp_paths = []
    starts = list(range(N)); rng.shuffle(starts)
    for s in starts:
        for pth in paths_from(s, len(SPANGRAM)-1, empty, {s}, rng, 6):
            full = [s] + pth
            if spans(full): sp_paths.append(full)
        if len(sp_paths) >= 30: break
    rng.shuffle(sp_paths)

    def rec(remaining):
        if time.time() > deadline: raise TimeoutError
        if not remaining: return not empty
        anchor = min(empty)
        for w in list(dict.fromkeys(remaining)):
            rest = remaining[:]; rest.remove(w)
            for path in placements(w, anchor, empty, rng):
                for k, cell in enumerate(path):
                    grid[cell] = w[k]; empty.discard(cell)
                placed[w] = path
                if feasible(empty, [len(x) for x in rest]) and rec(rest):
                    return True
                for cell in path:
                    grid[cell] = None; empty.add(cell)
                placed.pop(w, None)
        return False

    for spth in sp_paths:
        for k, cell in enumerate(spth):
            grid[cell] = SPANGRAM[k]; empty.discard(cell)
        placed[SPANGRAM] = spth
        if feasible(empty, [len(w) for w in order]) and rec(order):
            return grid, placed
        for cell in spth:
            grid[cell] = None; empty.add(cell)
        placed.pop(SPANGRAM, None)
        if time.time() > deadline: raise TimeoutError
    return None, None

def main():
    total = sum(len(w) for w in WORDS) + len(SPANGRAM)
    if total != N:
        print(f"Your words add up to {total} letters but the {ROWS}x{COLS} board "
              f"needs exactly {N}.")
        print(f"Add or remove {abs(N - total)} letters' worth of words and try again.")
        sys.exit(1)

    start = time.time()
    seed = 0
    while time.time() - start < 120:
        seed += 1
        try:
            g, p = attempt(random.Random(seed), min(start + 120, time.time() + 20))
        except TimeoutError:
            continue
        if not g: continue

        rows = ["".join(g[r*COLS + c] for c in range(COLS)) for r in range(ROWS)]
        print(f"  /* generated by tools/build-strands.py in {time.time()-start:.1f}s */")
        print("  strands: {")
        print(f'    theme: "{THEME}",')
        print(f'    clue: "{CLUE}",')
        print(f"    rows: {ROWS},")
        print(f"    cols: {COLS},")
        print("    grid: [")
        print(",\n".join(f'      "{row}"' for row in rows))
        print("    ],")
        print(f'    spangram: "{SPANGRAM}",')
        print("    paths: {")
        items = []
        for w in [SPANGRAM] + WORDS:
            pts = ",".join(f"[{x//COLS},{x%COLS}]" for x in p[w])
            items.append(f'      "{w}": [{pts}]')
        print(",\n".join(items))
        print("    }")
        print("  },")
        return

    print("Couldn't pack those words into the board. Try swapping a long word "
          "for a couple of short ones, long words are the hard part.")
    sys.exit(1)

if __name__ == "__main__":
    main()
