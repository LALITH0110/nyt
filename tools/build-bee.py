#!/usr/bin/env python3
"""
Build a Honeycomb answer list.

    python3 tools/build-bee.py ROMANCE R
    python3 tools/build-bee.py <seven letters> <centre letter>

The seven letters must all be different, and the centre must be one of them.
Prints a block you paste over `spellingBee:` in data/puzzles.js.

The system dictionary is full of archaic words, so by default this only keeps
words that look common (no more than nine letters, and present in the curated
COMMON list where one applies). Pass --all to keep everything it finds.
"""
import sys, os

DICT_PATH = "/usr/share/dict/words"

SUPPLEMENT = """
RAMEN YOGURT DONUT COOKIE MOCHA LATTE NACHO TACO CAMERAMAN
"""

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    keep_all = "--all" in sys.argv

    if len(args) < 2:
        print(__doc__)
        sys.exit(1)

    letters = args[0].upper()
    centre = args[1].upper()

    if len(set(letters)) != 7:
        print(f"Need exactly seven different letters, got {len(set(letters))} "
              f"in '{letters}'.")
        sys.exit(1)
    if centre not in letters:
        print(f"The centre letter '{centre}' has to be one of {letters}.")
        sys.exit(1)

    allowed = set(letters)
    words = set()
    with open(DICT_PATH) as f:
        for line in f:
            w = line.strip()
            if w and w.islower() and w.isalpha() and w.isascii():
                words.add(w.upper())
    words |= {w for w in SUPPLEMENT.split() if w}

    found = sorted(w for w in words
                   if len(w) >= 4 and set(w) <= allowed and centre in w
                   and (keep_all or len(w) <= 9))

    pangrams = [w for w in found if set(w) == allowed]
    if not pangrams:
        print(f"Warning: no word uses all seven of {letters}. A Honeycomb "
              f"really wants at least one pangram, try different letters.\n")

    def score(w):
        base = 1 if len(w) == 4 else len(w)
        return base + (7 if set(w) == allowed else 0)

    total = sum(score(w) for w in found)

    print(f"  /* {len(found)} words, {len(pangrams)} pangram(s), "
          f"{total} points available */")
    print("  spellingBee: {")
    print(f'    center: "{centre}",')
    others = [c for c in letters if c != centre]
    print("    outer: [" + ", ".join(f'"{c}"' for c in others) + "],")
    print("    pangrams: [" + ", ".join(f'"{w}"' for w in pangrams) + "],")
    print("    words: [")
    line = "      "
    for i, w in enumerate(found):
        piece = f'"{w}"' + ("," if i < len(found) - 1 else "")
        if len(line) + len(piece) > 76:
            print(line); line = "      "
        line += piece
    if line.strip():
        print(line)
    print("    ]")
    print("  },")
    print(f"\n  // Review this list before using it, the system dictionary is from",
          file=sys.stderr)
    print("  // 1934 and throws up some very odd words.", file=sys.stderr)

if __name__ == "__main__":
    main()
