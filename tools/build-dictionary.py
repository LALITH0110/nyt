#!/usr/bin/env python3
"""
Rebuild data/dict-wordle.js and data/dict-words.js.

You only need this if you want to add words the games don't currently accept
(e.g. a nickname, or a modern word the system dictionary predates).

    python3 tools/build-dictionary.py

Add your own words to SUPPLEMENT below, then re-run.
"""
import os

DICT_PATH = "/usr/share/dict/words"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")

# Words the 1934-era system dictionary is missing. Add your own here.
SUPPLEMENT = """
YOGURT YOGURTS BLOG BLOGS EMAIL EMAILS INTERNET WEBSITE ONLINE OFFLINE SELFIE SELFIES
TEXTED TEXTING EMOJI EMOJIS PIZZA PIZZAS TACO TACOS SUSHI BURRITO LATTE LATTES MOCHA
SODA DONUT DONUTS COOKIE COOKIES BRUNCH SNACK SNACKS PASTA NACHO NACHOS
RAMEN BAGEL BAGELS WAFFLE WAFFLES MUFFIN MUFFINS CUPCAKE CUPCAKES BROWNIE BROWNIES
OKAY VIBE VIBES CRUSH CRUSHES DATING SMOOCH CUDDLE CUDDLES SNUGGLE HUGS KISSES
BESTIE BAE BOO SWEETIE HUBBY WIFEY FIANCE SOULMATE
PHOTO PHOTOS VIDEO VIDEOS PODCAST PLAYLIST STREAM STREAMING DOWNLOAD UPLOAD
ADORBS AWESOME COOL FUNNY HAPPY LUCKY SUNNY SMILE SMILES LAUGH LAUGHS
BIRTHDAY BIRTHDAYS ANNIVERSARY PARTY PARTIES GIFT GIFTS PRESENT BALLOON BALLOONS
CANDLE CANDLES CONFETTI SPARKLE SPARKLES GLITTER
TIRAMISU BLACKFOREST REDVELVET TRESLECHES CHEESECAKE BUTTERSCOTCH
QUESADILLA APPAM SAMOSA SAMOSAS CHIPOTLE STARBUCKS MOCHA MATCHA FOCACCIA
MOZZARELLA PEONY PEONIES LILAC LILACS CARNATION CARNATIONS PEACOCK
WATERMELON MANGOES WHEELS KITKAT FERRERO VELLORE LECOM DYSON
CARROTS BANANAS STRAWBERRIES BISCUITS OLIVES PEPPERS TOMATOES
"""

def main():
    words = set()
    with open(DICT_PATH) as f:
        for line in f:
            w = line.strip()
            if w and w.islower() and w.isalpha() and w.isascii():
                words.add(w.upper())
    words |= {w for w in SUPPLEMENT.split() if w}

    supplement = {w for w in SUPPLEMENT.split() if w}
    five = sorted(w for w in words if len(w) == 5)
    # Long words are normally dropped to keep the file small, but never drop
    # one we deliberately added -- a puzzle answer may well be 11 letters.
    allw = sorted(w for w in words
                  if (3 <= len(w) <= 9) or (w in supplement and len(w) >= 3))

    hdr = ("/* Auto-generated word list. Regenerate with tools/build-dictionary.py.\n"
           "   Source: the system dictionary at /usr/share/dict/words, plus a\n"
           "   supplement of modern words that dictionary predates. */\n")

    with open(os.path.join(OUT_DIR, "dict-wordle.js"), "w") as f:
        f.write(hdr)
        f.write('window.DICT5 = new Set("' + " ".join(five) + '".split(" "));\n')
    with open(os.path.join(OUT_DIR, "dict-words.js"), "w") as f:
        f.write(hdr)
        f.write('window.DICT = new Set("' + " ".join(allw) + '".split(" "));\n')

    print(f"dict-wordle.js  {len(five):>6} words")
    print(f"dict-words.js   {len(allw):>6} words")

if __name__ == "__main__":
    main()
