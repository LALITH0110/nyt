/* Check puzzle content after editing data/puzzles.js. Run: node tools/validate.js */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'data/puzzles.js'), 'utf8'), context);
const p = context.window.PUZZLES;
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const letters = /^[A-Z]+$/;

check(letters.test(p.wordle.answer) && p.wordle.answer.length === 5, 'Wordle answer must be five capital letters.');
check(letters.test(p.secretWordle.answer) && p.secretWordle.answer.length === 5, 'Secret Wordle answer must be five capital letters.');

const groups = p.connections.groups;
check(groups.length === 4 && groups.every(g => g.words.length === 4), 'Connections needs four groups of four.');
const groupWords = groups.flatMap(g => g.words);
check(new Set(groupWords).size === 16, 'Connections words must be unique.');

const s = p.strands;
check(s.grid.length === s.rows && s.grid.every(row => row.length === s.cols), 'Strands grid dimensions do not match rows and cols.');
const seen = new Set();
Object.entries(s.paths).forEach(([word, cells]) => {
  const spelled = cells.map(([r,c]) => s.grid[r]?.[c] || '?').join('');
  check(spelled === word, `Strands path for ${word} spells ${spelled}.`);
  cells.forEach(([r,c], i) => {
    const key = `${r},${c}`;
    check(!seen.has(key), `Strands cell ${key} is used more than once.`);
    seen.add(key);
    if (i) check(Math.max(Math.abs(r-cells[i-1][0]), Math.abs(c-cells[i-1][1])) === 1, `Strands path for ${word} has a gap.`);
  });
});
check(seen.size === s.rows * s.cols, 'Strands paths must cover every cell.');
check(Object.hasOwn(s.paths, s.spangram), 'Strands spangram needs a path.');

const bee = p.spellingBee;
const beeLetters = new Set([bee.center, ...bee.outer]);
check(beeLetters.size === 7, 'Spelling Bee needs seven different letters.');
bee.words.forEach(word => check(word.length >= 4 && word.includes(bee.center) && [...word].every(ch => beeLetters.has(ch)), `Invalid Spelling Bee answer: ${word}.`));
bee.pangrams.forEach(word => check([...beeLetters].every(ch => word.includes(ch)), `Spelling Bee pangram ${word} does not use all letters.`));

function validateCrossword(name, puzzle) {
  const grid = puzzle.grid;
  const rows = grid.length, cols = grid[0]?.length || 0;
  check(rows > 0 && grid.every(row => row.length === cols && /^[A-Z#]+$/.test(row)), `${name} grid must be rectangular with capitals or #.`);
  const found = { across: [], down: [] };
  let num = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (grid[r][c] === '#') continue;
    const a = (c === 0 || grid[r][c-1] === '#') && c+1 < cols && grid[r][c+1] !== '#';
    const d = (r === 0 || grid[r-1][c] === '#') && r+1 < rows && grid[r+1][c] !== '#';
    if (a || d) { num++; if (a) found.across.push(num); if (d) found.down.push(num); }
  }
  for (const dir of ['across', 'down']) {
    const clues = puzzle[dir] || [];
    check(JSON.stringify(clues.map(c => c.num)) === JSON.stringify(found[dir]), `${name} ${dir} clue numbers do not match the grid.`);
    check(clues.every(c => c.clue && c.clue.trim()), `${name} has an empty ${dir} clue.`);
  }
}
validateCrossword('Mini', p.mini);
validateCrossword('Crossword', p.crossword);

const box = p.letterBoxed;
const sides = box.sides;
const allBox = sides.flat();
check(sides.length === 4 && sides.every(side => side.length === 3) && new Set(allBox).size === 12, 'Letter Boxed needs twelve unique letters on four sides.');
const sideOf = Object.fromEntries(sides.flatMap((side, i) => side.map(ch => [ch, i])));
const chain = box.solution;
check(chain.length <= box.maxWords, 'Letter Boxed solution exceeds maxWords.');
chain.forEach((word, i) => {
  check([...word].every(ch => sideOf[ch] != null), `Letter Boxed solution ${word} uses a missing letter.`);
  for (let j = 1; j < word.length; j++) check(sideOf[word[j]] !== sideOf[word[j-1]], `Letter Boxed solution ${word} repeats a side.`);
  if (i) check(chain[i-1].at(-1) === word[0], 'Letter Boxed solution is not a chain.');
});
check(allBox.every(ch => chain.join('').includes(ch)), 'Letter Boxed solution does not use every letter.');

const v = p.vault;
check(/^[0-9]+$/.test(String(v.code)), 'Vault code must be digits only.');
check(String(v.code).length >= 3, 'Vault code is too short.');
check(Array.isArray(v.hints) && v.hints.length > 0, 'Vault needs at least one hint.');
check(!v.hints.some(h => String(h).includes(String(v.code))), 'A vault hint gives the code away.');

const pages = ['index.html', ...['fiver','quartets','threads','honeycomb','mini','crossword','letterbox','vault'].map(n => `games/${n}.html`)];
pages.forEach(page => check(fs.existsSync(path.join(root, page)), `Missing page: ${page}.`));

if (errors.length) { errors.forEach(e => console.error(`✗ ${e}`)); process.exit(1); }
console.log('✓ Puzzle data and all eight game pages are consistent.');
