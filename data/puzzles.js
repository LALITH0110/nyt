/* ==========================================================================
   THE REB TIMES: PUZZLE DATA
   --------------------------------------------------------------------------
   *** THIS IS THE ONLY FILE YOU NEED TO EDIT TO CHANGE THE PUZZLES. ***

   Everything below is the content of the games. Change the values, refresh
   the browser, and the games update. Nothing else needs touching.

   Quick map of what to edit:
     PUZZLES.meta          -> site name, her name, the date on the masthead
     PUZZLES.wordle        -> the 5-letter answer
     PUZZLES.connections   -> the 4 groups of 4
     PUZZLES.strands       -> the word-hunt grid  (see the note there first)
     PUZZLES.spellingBee   -> the 7 letters + the answer list
     PUZZLES.mini          -> the 5x5 crossword grid + clues
     PUZZLES.crossword     -> the larger crossword grid + clues
     PUZZLES.letterBoxed   -> the 12 letters on 4 sides
     PUZZLES.vault         -> the eight-digit code and its hints

   Rules of thumb:
     - Always use CAPITAL LETTERS for answers.
     - If a word isn't accepted, add it to SUPPLEMENT in
       tools/build-dictionary.py and re-run that script.
   ========================================================================== */

window.PUZZLES = {

  /* ---------------------------------------------------------------- meta */
  meta: {
    brand: "The Reb Times",     // shown on the masthead
    section: "Games",
    recipient: "Reb",           // used in the welcome + win messages
    // Masthead date. Set to a fixed string like "September 18, 2026" to pin
    // it to her birthday, or leave as null to always show today's date.
    date: null,
    tagline: "All the puzzles that are fit to print.",
    footerNote: "made by yours truly"
  },

  /* -------------------------------------------------------------- wordle */
  wordle: {
    answer: "MUTHE",            // must be exactly 5 letters
    hint: "What Lalith calls you.",
    // true  = only real dictionary words are accepted as guesses
    // false = any 5 letters are accepted (easier / more forgiving)
    strictDictionary: false,
    // If set, these are the ONLY guesses the game will accept. Anything else
    // bounces with "Not in word list". Leave null to use strictDictionary.
    wordList: null
  },

  /* Revealed only when MUTHE is the first Wordle guess. */
  secretWordle: {
    answer: "LALLU",
    hint: "No hint this time.",
    strictDictionary: false,
    wordList: null
  },

  /* --------------------------------------------------------- connections */
  // Four groups of exactly four. `level` sets the difficulty colour:
  //   0 = yellow (easiest)  1 = green   2 = blue   3 = purple (trickiest)
  connections: {
    groups: [
      { level: 1, title: "COUSINS",
        words: ["ANJALI", "JOHNATHAN", "MATTHEW", "JAMES"] },
      { level: 2, title: "GIRL FRIENDS",
        words: ["ANU", "SHRUTHI", "NIVEDITHA", "ARIANNA"] },
      { level: 0, title: "UGLY PEOPLE",
        words: ["VIJAY", "TOVINO", "UNNI", "DHRUV"] },
      { level: 3, title: "PLACES",
        words: ["ANDREW", "LURIE", "HUSSAIN", "THOMAS"] }
    ]
  },

  /* -------------------------------------------------------------- strands */
  /* HEADS UP: this grid is a perfect packing, every one of the 48 letters
     belongs to exactly one word. You can't just retype letters by hand and
     expect it to work. To build a new one, run:

         python3 tools/build-strands.py

     ...after editing the word list at the top of that script. It prints a
     replacement block to paste in here. The spangram is the theme word that
     stretches all the way across the board. */
  strands: {
    theme: "Her cake order",
    clue: "Pick a flavour, but flavours for what?",
    rows: 8,
    cols: 6,
    grid: [
      "CAGOUS",
      "KRNAMI",
      "EARMRA",
      "CEEOBI",
      "SETHIT",
      "AKECHR",
      "CYADTA",
      "VANILL"
    ],
    spangram: "BIRTHDAYCAKE",
    // Each word maps to its path through the grid as [row, col] pairs.
    paths: {
      "BIRTHDAYCAKE": [[3,4],[4,4],[5,5],[6,4],[5,4],[6,3],[6,2],[6,1],[6,0],[5,0],[5,1],[5,2]],
      "CHEESECAKE":   [[5,3],[4,3],[3,2],[3,1],[4,0],[4,1],[3,0],[2,1],[1,0],[2,0]],
      "TIRAMISU":     [[4,5],[3,5],[2,4],[2,5],[1,4],[1,5],[0,5],[0,4]],
      "VANILLA":      [[7,0],[7,1],[7,2],[7,3],[7,4],[7,5],[6,5]],
      "CARROT":       [[0,0],[0,1],[1,1],[2,2],[3,3],[4,2]],
      "MANGO":        [[2,3],[1,3],[1,2],[0,2],[0,3]]
    }
  },

  /* --------------------------------------------------------- spellingBee */
  /* `center` must be used in every word. `outer` are the other six.
     `words` is the official answer list used for scoring and ranks.
     Any other real word made from these letters still counts, it just
     shows up as a bonus find. Rebuild the answer list with:

         python3 tools/build-bee.py ROMANCE R                              */
  spellingBee: {
    center: "T",
    outer: ["I", "R", "A", "M", "S", "U"],
    pangrams: ["TIRAMISU", "ATRIUMS"],
    words: [
      "ARTIST","ARTISTS","ASSIST","ATRIUM","ATRIUMS","AUTISM","MART",
      "MARTS","MAST","MASTS","MATS","MIST","MISTS","MUST","MUTT","MUTTS",
      "RATS","RUST","RUSTS","SITAR","SITS","SMART","SMARTS","STAIR",
      "STAIRS","STAR","START","STARTS","STATUS","STIR","STIRS","STRAIT",
      "STRAITS","STRUM","STRUMS","STRUT","STRUTS","SUIT","SUITS","SUMMIT",
      "TARTS","TAUT","TIARA","TIARAS","TIRAMISU","TRAIT","TRAITS","TRAM",
      "TRAMS","TRAUMA","TRIM","TRIMS","TRUSS","TRUST","TRUSTS","TSAR",
      "TSARS","TUTU","TUTUS"
    ]
  },

  /* ---------------------------------------------------------------- mini */
  /* A 5x5 crossword about Rebecca's favorites. Use "#" for a black square.
     Every white square belongs to an Across and a Down answer. Clue numbers
     are worked out automatically, keep the clues in grid order. */
  mini: {
    title: "The Mini",
    grid: [
      "ACT##",
      "BORS#",
      "CREAM",
      "#NAME",
      "##TEN"
    ],
    across: [
      { num: 1, clue: "Before Lalith needs to go into ___ing, he needs to consult Rebecca" },
      { num: 4, clue: "Our group at Illinois Institute of Technology" },
      { num: 6, clue: "One of your favorite ice creams: cookies and ___" },
      { num: 8, clue: "What appears on my phone when you call and makes me smile" },
      { num: 9, clue: "How I rate you, out of ten" }
    ],
    down: [
      { num: 1, clue: "The first three letters Rebecca learned" },
      { num: 2, clue: "The best side on your Chipotle quesadilla plate" },
      { num: 3, clue: "The KitKat I buy you after your exam, for example" },
      { num: 5, clue: "Dumbo and Dustbin are ___" },
      { num: 7, clue: "Who I want you to stay away from (plural of man)" }
    ]
  },

  /* ------------------------------------------------------------ crossword */
  /* A 7x7 daily. "#" is a black square. Clue numbers are worked out
     automatically, so keep each clue list in the order the numbers appear.
     Rebuild the grid with:  python3 tools/build-crossword.py crossword     */
  crossword: {
    title: "The Crossword",
    grid: [
      "SIR#IIT",
      "ACE#NOR",
      "DESTINY",
      "##POT##",
      "PEONIES",
      "URN#AGE",
      "PAD#LOT"
    ],
    across: [
      { num: 1,  clue: "Yes ___, yes ma'am" },
      { num: 4,  clue: "___ Bors (our college)" },
      { num: 7,  clue: "What you did on that exam you were panicking about" },
      { num: 8,  clue: "Neither this ___ that" },
      { num: 9,  clue: "Me meeting you is ___" },
      { num: 11, clue: "Where you keep the flowers I give you" },
      { num: 12, clue: "Your other favourite flower, big and ruffled" },
      { num: 16, clue: "ikik it's not a pot it's a vase, so what do you call the posh vase my roses go in?" },
      { num: 17, clue: "The number on the candles you blew out today" },
      { num: 18, clue: "Where you write your notes to study, i___" },
      { num: 19, clue: "How much I love you: a ___" }
    ],
    down: [
      { num: 1,  clue: "How I feel without you" },
      { num: 2,  clue: "When you're angry \uD83D\uDE20 you're ___-cold. Also our fav drink: ___d matcha latte" },
      { num: 3,  clue: "What you do to my texts in about four seconds" },
      { num: 4,  clue: "What LK and RM are" },
      { num: 5,  clue: "Charged particle. _ am turned __ right now \uD83E\uDD75" },
      { num: 6,  clue: "Anime" },
      { num: 10, clue: "How much I miss you rn" },
      { num: 12, clue: "Bolt when he was small" },
      { num: 13, clue: "A stretch of time, like the one after March 2023 \uD83D\uDE18" },
      { num: 14, clue: "What you don't like about me" },
      { num: 15, clue: "I'll be the volleyball spiker, you be the one to ___" }
    ]
  },

  /* --------------------------------------------------------- letterBoxed */
  /* Twelve letters, three per side. Consecutive letters of a word may never
     come from the same side. Each word must start with the letter the
     previous word ended on. `solution` is the intended two-word answer ,
     it's only used for the "reveal" button, any valid chain wins. */
  letterBoxed: {
    sides: [
      ["A", "B", "F"],   // top
      ["E", "L", "R"],   // right
      ["G", "I", "U"],   // bottom
      ["O", "S", "T"]    // left
    ],
    maxWords: 3,
    // BEAUTIFUL and GORGEOUS between them use all twelve letters exactly once
    // each, but they cannot follow each other (BEAUTIFUL ends L, GORGEOUS
    // starts G), so a short link word joins them up.
    solution: ["BEAUTIFUL", "LOG", "GORGEOUS"]
  },

  /* --------------------------------------------------------------- vault */
  /* An eight-digit code to crack, scored like the word game: green for a
     digit in the right place, gold for a digit that is in the code but
     somewhere else. Change `code` to any run of digits and the board
     resizes itself. Hints are revealed one at a time, in order.          */
  vault: {
    code: "03312023",
    tries: 6,
    prompt: "Eight digits. You know them by heart.",
    hints: [
      "It's a date.",
      "Month, then day, then year.",
      "It happened in the spring.",
      "The very last day of March, 2023."
    ],
    winMessage: "31 March 2023."
  }

};
