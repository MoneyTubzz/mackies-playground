const canvas     = document.getElementById('tetris');
const ctx        = canvas.getContext('2d');
const scoreEl    = document.getElementById('score');
const startBtn   = document.getElementById('start');
const pauseBtn   = document.getElementById('pause');
const restartBtn = document.getElementById('restart');
const overlay    = document.getElementById('overlay');
const ovRestart  = document.getElementById('overlay-restart');

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;
ctx.scale(BLOCK, BLOCK);

let arena, player, colors;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let animationId = null;
let gameOver = false;
let paused = false;

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function createPiece(type) {
  switch (type) {
    case 'T': return [[0,0,0],[1,1,1],[0,1,0]];
    case 'O': return [[2,2],[2,2]];
    case 'L': return [[0,3,0],[0,3,0],[0,3,3]];
    case 'J': return [[0,4,0],[0,4,0],[4,4,0]];
    case 'I': return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
    case 'S': return [[0,6,6],[6,6,0],[0,0,0]];
    case 'Z': return [[7,7,0],[0,7,7],[0,0,0]];
  }
}

function initGame() {
  arena = createMatrix(COLS, ROWS);
  player = { pos: {x:0,y:0}, matrix: null, score: 0 };
  updateScore();
  playerReset();
  gameOver = false;
  paused = false;
  overlay.classList.add('hidden');
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        ctx.fillStyle = colors[val];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, COLS, ROWS);
  drawMatrix(arena, {x:0,y:0});
  drawMatrix(player.matrix, player.pos);
}

function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) arena[y + player.pos.y][x + player.pos.x] = value;
    });
  });
}

function arenaSweep() {
  outer: for (let y = ROWS - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (!arena[y][x]) continue outer;
    }
    arena.splice(y, 1);
    arena.unshift(new Array(COLS).fill(0));
    player.score += 10;
    ++y;
  }
}

function playerReset() {
  const pieces = 'ILJOTSZ';
  player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
  player.pos.y = 0;
  player.pos.x = ((COLS / 2) | 0) - ((player.matrix[0].length / 2) | 0);
  if (collide(arena, player)) {
    gameOver = true;
    cancelAnimationFrame(animationId);
    overlay.classList.remove('hidden');
  }
}

function playerDrop() {
  if (gameOver || paused) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    updateScore();
    playerReset();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  if (gameOver || paused) return;
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}

function playerRotate(dir) {
  if (gameOver || paused) return;
  const m = player.matrix;
  // transpose
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
    }
  }
  // reverse
  dir > 0 ? m.forEach(row => row.reverse()) : m.reverse();
  // wall kicks
  let offset = 1;
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > m[0].length) {
      // undo rotation
      dir > 0 ? m.forEach(row => row.reverse()) : m.reverse();
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
      }
      return;
    }
  }
}

function update(time = 0) {
  if (gameOver || paused) return;
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  animationId = requestAnimationFrame(update);
}

function updateScore() {
  scoreEl.textContent = player.score;
}

document.addEventListener('keydown', event => {
  if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp'].includes(event.key) || event.code === 'Space') {
    event.preventDefault();
  }
  if (event.key === 'ArrowLeft') playerMove(-1);
  else if (event.key === 'ArrowRight') playerMove(1);
  else if (event.key === 'ArrowDown') playerDrop();
  else if (event.key === 'ArrowUp') playerRotate(1);
  else if (event.code === 'Space') {
    while (!collide(arena, player)) player.pos.y++;
    player.pos.y--;
    merge(arena, player);
    arenaSweep();
    updateScore();
    playerReset();
    dropCounter = 0;
  }
});

startBtn.addEventListener('click', () => {
  initGame();
  update();
});

pauseBtn.addEventListener('click', () => {
  if (gameOver) return;
  paused = !paused;
  if (paused) cancelAnimationFrame(animationId);
  else update();
});

restartBtn.addEventListener('click', () => {
  initGame();
  update();
});

ovRestart.addEventListener('click', () => {
  initGame();
  update();
});

colors = [
  null,
  '#FF0D72','#0DC2FF','#0DFF72',
  '#F538FF','#FF8E0D','#FFE138','#3877FF'
];

initGame();