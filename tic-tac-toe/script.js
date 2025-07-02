// grab elements
const cells      = Array.from(document.querySelectorAll('.cell'));
const messageEl  = document.getElementById('message');
const restartBtn = document.getElementById('restart');

// game state
let board, currentPlayer, gameActive;

// winning index combinations
const winCombos = [
  [0,1,2], [3,4,5], [6,7,8],  // rows
  [0,3,6], [1,4,7], [2,5,8],  // cols
  [0,4,8], [2,4,6]            // diags
];

// initialize or reset the game
function initGame() {
  board         = Array(9).fill('');
  currentPlayer = 'X';
  gameActive    = true;
  messageEl.textContent = `Player ${currentPlayer}’s turn`;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
    cell.addEventListener('click', handleCellClick);
  });
}

// handle a cell click
function handleCellClick(e) {
  const idx = Number(e.target.dataset.index);
  if (!gameActive || board[idx] !== '') return;
  
  // mark and render
  board[idx] = currentPlayer;
  e.target.textContent = currentPlayer;

  checkResult();
}

// check for win/draw or switch player
function checkResult() {
  let roundWon = false;

  for (const combo of winCombos) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      roundWon = true;
      // highlight winning cells
      combo.forEach(i => cells[i].classList.add('win'));
      break;
    }
  }

  if (roundWon) {
    messageEl.textContent = `🎉 Player ${currentPlayer} wins!`;
    gameActive = false;
    return;
  }

  if (!board.includes('')) {
    messageEl.textContent = `🤝 It’s a draw!`;
    gameActive = false;
    return;
  }

  // switch turns
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  messageEl.textContent = `Player ${currentPlayer}’s turn`;
}

// restart button
restartBtn.addEventListener('click', initGame);

// start on load
initGame();