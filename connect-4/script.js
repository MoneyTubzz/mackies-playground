(() => {
  const ROWS = 6, COLS = 7;
  let boardState = [], currentPlayer = 1, gameOver = false;

  const boardEl    = document.getElementById('board');
  const messageEl  = document.getElementById('message');
  const restartBtn = document.getElementById('restart');

  function init() {
    boardState = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    currentPlayer = 1;
    gameOver = false;
    messageEl.textContent = "Red’s turn";
    boardEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        boardEl.appendChild(cell);
      }
    }
  }

  function render() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c;
        const cell = boardEl.children[idx];
        cell.classList.remove('red','yellow','win');
        if (boardState[r][c]===1) cell.classList.add('red');
        if (boardState[r][c]===2) cell.classList.add('yellow');
      }
    }
  }

  function checkWin() {
    const dirs = [
      [[0,1],[0,2],[0,3]],
      [[1,0],[2,0],[3,0]],
      [[1,1],[2,2],[3,3]],
      [[1,-1],[2,-2],[3,-3]]
    ];
    for (let r=0;r<ROWS;r++){
      for (let c=0;c<COLS;c++){
        const p = boardState[r][c]; if (!p) continue;
        for (let d of dirs) {
          const line = [[r,c]];
          for (let [dr,dc] of d) {
            const nr=r+dr,nc=c+dc;
            if (nr<0||nr>=ROWS||nc<0||nc>=COLS||boardState[nr][nc]!==p) break;
            line.push([nr,nc]);
          }
          if (line.length===4) return line;
        }
      }
    }
    return null;
  }

  function dropInColumn(c) {
    if (gameOver) return false;
    for (let r=ROWS-1;r>=0;r--){
      if (!boardState[r][c]) {
        boardState[r][c]=currentPlayer;
        return true;
      }
    }
    return false;
  }

  boardEl.addEventListener('click', e => {
    if (gameOver) return;
    if (!e.target.classList.contains('cell')) return;
    const c = +e.target.dataset.col;
    if (!dropInColumn(c)) return;
    render();
    const winLine = checkWin();
    if (winLine) {
      gameOver = true;
      winLine.forEach(([r,c]) => {
        boardEl.children[r*COLS+c].classList.add('win');
      });
      messageEl.textContent = (currentPlayer===1?'Red':'Yellow') + ' wins!';
      return;
    }
    if (boardState.flat().every(v=>v!==0)) {
      gameOver = true;
      messageEl.textContent = 'Draw!';
      return;
    }
    currentPlayer = 3 - currentPlayer;
    messageEl.textContent = (currentPlayer===1?'Red’s':'Yellow’s') + ' turn';
  });

  restartBtn.addEventListener('click', () => {
    init(); render();
  });

  init();
  render();
})();