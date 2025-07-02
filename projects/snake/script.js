const canvas     = document.getElementById('game');
const ctx        = canvas.getContext('2d');
const scoreEl    = document.getElementById('score');
const startBtn   = document.getElementById('start');
const pauseBtn   = document.getElementById('pause');
const restartBtn = document.getElementById('restart');
const overlay    = document.getElementById('overlay');
const ovRestart  = document.getElementById('overlay-restart');

const COLS = 20, ROWS = 20, SIZE = 20;
let snake, dir, food, score;
let loopId = null, paused = false;

function initGame() {
  snake = [{ x: 10, y: 10 }];
  dir   = { x: 1, y: 0 };
  placeFood();
  score = 0;
  scoreEl.textContent = score;
  paused = false;
  clearInterval(loopId);
  draw();
}

function placeFood() {
  food = {
    x: Math.floor(Math.random() * COLS),
    y: Math.floor(Math.random() * ROWS)
  };
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * SIZE, y * SIZE, SIZE, SIZE);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, COLS * SIZE, ROWS * SIZE);
  drawCell(food.x, food.y, 'red');
  snake.forEach((seg, i) => {
    drawCell(seg.x, seg.y, i === 0 ? 'lime' : 'green');
  });
}

function update() {
  if (paused) return;
  const head = {
    x: (snake[0].x + dir.x + COLS) % COLS,
    y: (snake[0].y + dir.y + ROWS) % ROWS
  };
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    clearInterval(loopId);
    paused = true;
    overlay.classList.remove('hidden'); 
    return;
  }
  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }
  draw();
}

document.addEventListener('keydown', e => {
  if      (e.key === 'ArrowUp'    && dir.y === 0) dir = { x: 0,  y: -1 };
  else if (e.key === 'ArrowDown'  && dir.y === 0) dir = { x: 0,  y:  1 };
  else if (e.key === 'ArrowLeft'  && dir.x === 0) dir = { x: -1, y:  0 };
  else if (e.key === 'ArrowRight' && dir.x === 0) dir = { x:  1, y:  0 };
});

startBtn.addEventListener('click', () => {
  clearInterval(loopId);
  paused = false;
  loopId = setInterval(update, 100);
});

pauseBtn.addEventListener('click', () => {
  paused = true;
  clearInterval(loopId);
});

restartBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  initGame();
});

// overlay Restart
ovRestart.addEventListener('click', () => {
  overlay.classList.add('hidden');
  initGame();
});


initGame();