# The Reb Times: Games

Eight hand-built puzzle games in a newspaper-style dashboard. No build step, no
dependencies, no server needed. Open `index.html` and it runs.

The puzzle data, artwork, and site branding are original. Familiar game titles
describe the recreations. This is an unofficial personal project and is not
affiliated with The New York Times.

## The games

| Game | What it is |
|---|---|
| **Wordle** | Guess a five-letter word in six tries |
| **Connections** | Sort sixteen words into four secret groups of four |
| **Strands** | Word hunt where every letter belongs to a theme word |
| **Spelling Bee** | Spell words from seven letters, all using the middle one |
| **The Mini** | A 5×5 crossword |
| **The Crossword** | A fully crossed 7×7 puzzle with Across and Down clues |
| **Letter Boxed** | Chain words around a square using all twelve letters |
| **The Vault** | Crack an eight-digit code from colour feedback |

Progress, streaks and stats are saved in the browser's local storage, per
device. Nothing is sent anywhere.

## Changing the puzzles

**Everything you need to edit is in one file: `data/puzzles.js`.**

It is heavily commented. Change the values, save, refresh the browser. Start
with `PUZZLES.meta` to set the site name, her name and the masthead date.

Some puzzles have a catch, because their data has to be internally consistent:

- **Strands**, the grid is a perfect packing where all 48 letters belong to
  exactly one word. Don't retype it by hand. Edit the word list at the top of
  `tools/build-strands.py` and run it; it prints a replacement block to paste in.
- **Spelling Bee**, the answer list must match the seven letters. Run
  `python3 tools/build-bee.py ROMANCE R` (letters, then the centre letter) to
  print a fresh block.
- **The Mini and The Crossword**, keep the clue numbers aligned with the grid.
  `node tools/validate.js` checks the numbering for you.

If a word you expect isn't accepted, add it to `SUPPLEMENT` in
`tools/build-dictionary.py` and run that script.

```bash
python3 tools/build-strands.py          # rebuild the Strands grid
python3 tools/build-bee.py LOVED D      # rebuild the Spelling Bee answer list
python3 tools/build-dictionary.py       # rebuild the accepted-words lists
node tools/validate.js                  # check puzzle data before deploying
```

## Running it locally

Opening `index.html` directly works in most browsers. If yours blocks local
files, run a tiny server:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying with Vercel

Import the public `nyt` GitHub repository into Vercel. This is a static HTML
site, so leave the build command empty and use the repository root as the
output directory. Vercel will deploy the files directly.

The local `HER-FAVOURITES.txt` writing notes are excluded from the public
repository. The live puzzle content is in `data/puzzles.js`.

### A note on size

`data/dict-words.js` is about 850 KB, it's the word list that Strands,
Spelling Bee and Letter Boxed check guesses against. Any host will gzip it down to
roughly a quarter of that. Only those three pages load it; the dashboard and
the other seven games don't.

## Layout

```
index.html              the dashboard
data/puzzles.js         *** all puzzle content, edit this ***
data/dict-wordle.js     five-letter words, for Wordle
data/dict-words.js      3–9 letter words, for the word games
assets/css/base.css     shared design system
assets/js/core.js       shared runtime: storage, modals, keyboard, confetti
games/*.html            one self-contained file per game
tools/*.py              regenerate puzzle data and word lists
tools/validate.js       checks data consistency and page presence
```

Each game is a single self-contained HTML file. To change how one game looks or
behaves, that one file is the only place to look.
