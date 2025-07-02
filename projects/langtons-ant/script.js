const canvas = document.getElementById('antCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startStop');
const resetBtn = document.getElementById('reset');
const addAntBtn = document.getElementById('addAnt');
const speedInp = document.getElementById('speed');
const colorInp = document.getElementById('colorCount');

let grid, cols, rows, cellSize;
let ants = [];
let running = false, rafId;

// default settings
const WIDTH = 1250;
const HEIGHT = 650;

canvas.width = WIDTH;
canvas.height = HEIGHT;

function init() {
    const N = parseInt(colorInp.value, 10);
    cols = Math.floor(WIDTH / 5);
    rows = Math.floor(HEIGHT / 5);
    cellSize = WIDTH / cols;


    // 2D grid of states [0..N-1]
    grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    ants = [{
        x: Math.floor(cols / 2),
        y: Math.floor(rows / 2),
        dir: 0  // 0=up,1=right,2=down,3=left 
    }];

    draw();
}

const vivid = [
  '#2dd55b','#c5000f','#0054e9','#f2a4e2',
  '#F58231','#911EB4','#46F0F0','#F032E6',
  '#D2F53C','#FABEBE'
];

function draw() {
  const N = parseInt(colorInp.value, 10);
  // state 0 = blank white
  const palette = ['#ffffff'];
  // states 1…N-1 = HSL rainbow
  for (let i = 1; i < N; i++) {
    const hue = Math.floor(360 * (i - 1) / (N - 1));
   // pick the first N-1 vivid colors
  palette.push(...vivid.slice(0, N-1));
  }

  // draw the grid
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = palette[ grid[y][x] ];
      ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
    }
  }

 ants.forEach(({ x, y }) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(
      x * cellSize - cellSize/4,
      y * cellSize - cellSize/4,
      cellSize * 1.5,
      cellSize * 1.5
    );
  });
}

function step() {
  const N = parseInt(colorInp.value, 10);

  ants.forEach(ant => {
    // read & turn
    const state = grid[ant.y][ant.x];
    ant.dir = (ant.dir + (state % 2 === 0 ? 1 : -1) + 4) % 4;

    // flip cell
    grid[ant.y][ant.x] = (state + 1) % N;

    // move forward
    if (ant.dir === 0) ant.y--;
    if (ant.dir === 1) ant.x++;
    if (ant.dir === 2) ant.y++;
    if (ant.dir === 3) ant.x--;

    // wrap
    ant.x = (ant.x + cols) % cols;
    ant.y = (ant.y + rows) % rows;
  });

  draw();
}

function loop() {
  step();
  rafId = setTimeout(loop, 1000 / speedInp.value);
}

startBtn.addEventListener('click', () => {
  if (!running) {
    running = true;
    startBtn.textContent = 'Pause';
    loop();
  } else {
    running = false;
    startBtn.textContent = 'Start';
    clearTimeout(rafId);
  }
});

resetBtn.addEventListener('click', () => {
  clearTimeout(rafId);
  running = false;
  startBtn.textContent = 'Start';
  init();
});

addAntBtn.addEventListener('click', () => {
  ants.push({
    x:   Math.floor(Math.random() * cols),
    y:   Math.floor(Math.random() * rows),
    dir: Math.floor(Math.random() * 4)
  });
});


colorInp.addEventListener('change', init);
speedInp.addEventListener('input', () => {
  if (running) {
    clearTimeout(rafId);
    loop();
  }
});

// initialize on load
init();