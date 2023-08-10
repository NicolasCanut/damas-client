// Variables globales
let currentPlayer = 'white'; // white or black
let selectedPiece = null;
let gameBoard = [];

// Crea el tablero de damas
function createBoard() {
  const boardElement = document.getElementById('board');
  for (let row = 0; row < 8; row++) {
    gameBoard[row] = [];
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener('click', handleCellClick);

      // Aplicar clases para alternar colores de celda
      if ((row + col) % 2 === 0) {
        cell.classList.add('white-cell');
      } else {
        cell.classList.add('black-cell');
      }

      boardElement.appendChild(cell);
      gameBoard[row][col] = null;
    }
  }

  // Ahora, después de crear las celdas, agregamos las piezas iniciales al tablero
  initializePieces();
}




// Verifica si la pieza puede moverse a la celda especificada
function canMoveTo(piece, newRow, newCol) {
  if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
    return false;
  }

  const currentRow = piece.row;
  const currentCol = piece.col;
  const diffRow = Math.abs(newRow - currentRow);
  const diffCol = Math.abs(newCol - currentCol);

  if (diffRow === 1 && diffCol === 1) {
    // Verificar si la celda destino está vacía y si hay una ficha enemiga en el camino
    const targetCell = gameBoard[newRow][newCol];
    const middleRow = (newRow + currentRow) / 2;
    const middleCol = (newCol + currentCol) / 2;
    
    // Modificar el cálculo de la celda intermedia
    const middlePiece = gameBoard[Math.floor(middleRow)][Math.floor(middleCol)];

    return !targetCell && middlePiece && middlePiece.color !== piece.color;
  }

  return false;
}



// Maneja el clic en una celda
function handleCellClick(event) {
  const cell = event.target;

  // Verificar si el elemento clicado es una celda y no una ficha
  if (!cell.classList.contains('cell')) {
    return;
  }

  console.log('click en celda');
  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const piece = getPiece(row, col);

  if (!selectedPiece) {
    if (piece && piece.color === currentPlayer) {
      console.log('Seleccionada pieza válida');
      selectedPiece = piece;
      highlightPossibleMoves(selectedPiece);
    }
  } else {
    const isValidMove = canMoveTo(selectedPiece, row, col);
    if (isValidMove) {
      const directionRow = selectedPiece.color === 'white' ? -1 : 1; 
      const directionCol = Math.sign(col - selectedPiece.col);

      const newRow = row + directionRow;
      const newCol = col + directionCol;


      if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
        const targetCell = gameBoard[newRow][newCol];
        const targetPiece = targetCell ? targetCell : null;

        movePiece(selectedPiece, newRow, newCol, targetPiece);
        selectedPiece = null;
        // Cambiar turno
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        checkWinCondition();
        checkDrawCondition();
      }
    }
  }
}

// Obtiene la pieza en la celda especificada
function getPiece(row, col) {
  console.log('getPiece - row:', row);
  console.log('getPiece - col:', col);
  return gameBoard[row][col];
}

// Destaca los movimientos posibles para la pieza seleccionada
function highlightPossibleMoves(piece) {
  clearHighlightedMoves(); // Limpia los resaltados anteriores

  // Obtiene la fila y columna de la ficha seleccionada
  const { row, col } = piece;

  // Determina las direcciones permitidas para moverse según la ficha y su color
  const directions = piece.isKing ? [-1, 1] : piece.color === 'white' ? [-1] : [1];

  // Itera a través de las direcciones permitidas
  for (const direction of directions) {
    // Calcula la nueva fila y las columnas izquierda y derecha
    const newRow = row + direction;
    const leftCol = col - 1;
    const rightCol = col + 1;

    // Verifica si el movimiento hacia la izquierda es válido
    if (isValidMove(piece, newRow, leftCol)) {
      // Selecciona la celda correspondiente y la resalta visualmente
      const cell = document.querySelector(`[data-row="${newRow}"][data-col="${leftCol}"]`);
      cell.classList.add('highlight');
      
      // Agrega un evento de clic que llama a handleHighlightedCellClick con los parámetros adecuados
      cell.addEventListener('click', () => handleHighlightedCellClick(piece, newRow, leftCol));
    }

    // Verifica si el movimiento hacia la derecha es válido
    if (isValidMove(piece, newRow, rightCol)) {
      // Selecciona la celda correspondiente y la resalta visualmente
      const cell = document.querySelector(`[data-row="${newRow}"][data-col="${rightCol}"]`);
      cell.classList.add('highlight');
      
      // Agrega un evento de clic que llama a handleHighlightedCellClick con los parámetros adecuados
      cell.addEventListener('click', () => handleHighlightedCellClick(piece, newRow, rightCol));
    }
  }
}



function handleHighlightedCellClick(piece, newRow, newCol) {
  console.log('handleHighlightedCellClick llamada');
  if (isValidMove(piece, newRow, newCol)) {
    console.log('Movimiento válido');
    movePiece(piece, newRow, newCol);
  
    // Eliminar la ficha enemiga
    const middleRow = Math.floor((newRow + piece.row) / 2);
    const middleCol = Math.floor((newCol + piece.col) / 2);
    const middlePiece = gameBoard[middleRow][middleCol];
    if (middlePiece) {
      gameBoard[middleRow][middleCol] = null;
      const middleCell = document.querySelector(`[data-row="${middleRow}"][data-col="${middleCol}"]`);
      middleCell.removeChild(middleCell.firstElementChild);
      updateScore(1); // Incrementar el puntaje
    }
  
    selectedPiece = null;
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    checkWinCondition();
    checkDrawCondition();
  }

  // Limpia los resaltados y los event listeners
  clearHighlightedMoves();
}




function clearHighlightedMoves() {
  document.querySelectorAll('.cell.highlight').forEach(cell => {
    cell.classList.remove('highlight');
    cell.removeEventListener('click', handleHighlightedCellClick);
  });
}

function handlePieceClick(piece) {
  console.log('click en una ficha')
  if (piece.color === currentPlayer) {
    clearHighlightedMoves(); // Limpia los resaltados anteriores
    selectedPiece = piece;
    highlightPossibleMoves(selectedPiece); // Llama a la función para resaltar movimientos válidos
  }
}

function initializePieces() {
  // Agregar las piezas iniciales al tablero
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        if (row < 3) {
          const piece = { row, col, color: 'white', isKing: false };
          gameBoard[row][col] = piece;
          const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          const pieceElement = document.createElement('div');
          pieceElement.className = 'piece white';
          pieceElement.addEventListener('click', () => handlePieceClick(piece));
          cell.appendChild(pieceElement);
          pieceElement.dataset.row = row;
          pieceElement.dataset.col = col;
        } else if (row > 4) {
          const piece = { row, col, color: 'black', isKing: false };
          gameBoard[row][col] = piece;
          const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
          const pieceElement = document.createElement('div');
          pieceElement.className = 'piece black';
          pieceElement.addEventListener('click', () => handlePieceClick(piece));
          cell.appendChild(pieceElement);
          pieceElement.dataset.row = row; 
          pieceElement.dataset.col = col;
        }
      }
    }
  }
}

// Verifica si la pieza puede moverse a la celda especificada
function isValidMove(piece, newRow, newCol) {
  if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) {
    return false;
  }

  const currentRow = piece.row;
  const currentCol = piece.col;
  const diffRow = Math.abs(newRow - currentRow);
  const diffCol = Math.abs(newCol - currentCol);

if (diffRow === 1 && diffCol === 1) {
  // Verificar si la celda destino está vacía
  const targetCell = gameBoard[newRow][newCol];
  return !targetCell;
}
 else if (diffRow === 2 && diffCol === 2) {
    // Verificar si se puede saltar sobre una pieza
    const middleRow = Math.floor((newRow + currentRow) / 2);
    const middleCol = Math.floor((newCol + currentCol) / 2);    
    const middlePiece = gameBoard[middleRow][middleCol];

    if (middlePiece && middlePiece.color !== piece.color) {
      // Verificar si la celda destino está vacía
      const targetCell = gameBoard[newRow][newCol];
      return !targetCell;
    }
  }

  return false;
}

// Realiza el movimiento de la pieza a la celda especificada
function movePiece(piece, newRow, newCol) {
  const { row, col } = piece;
  gameBoard[newRow][newCol] = piece;
  gameBoard[row][col] = null;
  piece.row = newRow;
  piece.col = newCol;
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  const targetCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
  
  // Verificar si hay una ficha enemiga en el camino
  const middleRow = Math.floor((newRow + row) / 2); // Redondear al entero más cercano
  const middleCol = Math.floor((newCol + col) / 2); // Redondear al entero más cercano
  const middlePiece = gameBoard[middleRow][middleCol];
  if (middlePiece) {
    // Eliminar la ficha enemiga del tablero
    gameBoard[middleRow][middleCol] = null;
    const middleCell = document.querySelector(`[data-row="${middleRow}"][data-col="${middleCol}"]`);
    middleCell.removeChild(middleCell.firstChild); // Eliminar la ficha visualmente
  
    // Actualizar puntajes de los jugadores
    const pointsEarned = 1; // Puedes ajustar esto según tus reglas
    updateScore(pointsEarned);
  }
  
  
  targetCell.appendChild(cell.firstElementChild);
  cell.removeChild(cell.firstElementChild);
  
  // Verificar si la pieza se convierte en reina
  if (!piece.isKing && (newRow === 0 || newRow === 7)) {
    piece.isKing = true;
    // Agrega la clase 'king' al elemento de la ficha
    cell.firstElementChild.classList.add('king');
  }
}


// Funcionalidad de guardar y cargar partida con LocalStorage
function saveGame() {
  const gameState = JSON.stringify({ board: gameBoard, player1Score, player2Score });
  localStorage.setItem('gameState', gameState);
}

function loadGame() {
  const savedGameState = localStorage.getItem('gameState');
  if (savedGameState) {
    const { board, player1Score: p1Score, player2Score: p2Score, currentPlayer: currPlayer } = JSON.parse(savedGameState);
    gameBoard = board;
    player1Score = p1Score;
    player2Score = p2Score;
    currentPlayer = currPlayer;
    // Actualizar visualmente la representación del tablero y el marcador de puntaje
    updateScore(0); // Actualizar marcador visual
  } else {
    alert('No hay partida guardada.')
  }
}

// Funcionalidad de puntaje y fin del juego
let player1Score = 0;
let player2Score = 0;

function updateScore(points) {
  if (currentPlayer === 'white') {
    player1Score += points;
    document.getElementById('player1-score').textContent = player1Score;
  } else {
    player2Score += points;
    document.getElementById('player2-score').textContent = player2Score;
  }
}

function checkWinCondition() {
  const piecesLeft = gameBoard.flat().filter(piece => piece && piece.color === currentPlayer).length;
  if (piecesLeft === 0) {
    const winner = currentPlayer === 'white' ? 'Negro' : 'Blanco';
    alert(`¡${winner} gana la partida!`);
  }
}

function checkDrawCondition() {
  const noMovesLeft = gameBoard.flat().every(piece => {
    if (piece && piece.color === currentPlayer) {
      return piece.isKing ? !canMoveTo(piece, piece.row + 1, piece.col - 1) && !canMoveTo(piece, piece.row + 1, piece.col + 1)
                          : !canMoveTo(piece, piece.row + 1, piece.col - 1) && !canMoveTo(piece, piece.row + 1, piece.col + 1) &&
                            !canMoveTo(piece, piece.row - 1, piece.col - 1) && !canMoveTo(piece, piece.row - 1, piece.col + 1);
    }
    return true;
  });

  if (noMovesLeft) {
    alert('¡Empate! No hay movimientos disponibles.');
  }
}

// Funcionalidad del formulario de contacto
// document.getElementById('email-link').addEventListener('click', function(event) {
//   event.preventDefault();
//   const name = document.getElementById('name').value;
//   const email = document.getElementById('email').value;
//   const message = document.getElementById('message').value;
  
//   const subject = "Mensaje desde el formulario de contacto";
//   const body = `Nombre: ${name}%0AEmail: ${email}%0AMensaje: ${message}`;
  
//   const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
//   window.location.href = mailtoLink;
// });



function sendEmail(name, email, message) {
  // Implementa lógica para enviar el email
  alert('Correo enviado: Nombre - ' + name + ', Email - ' + email + ', Mensaje - ' + message);
}

// Funcionalidad para mostrar la lista de partidas y abrir enlace a Github
// const githubLink = document.getElementById('github-link');
// githubLink.addEventListener('click', openGithubLink);

// function openGithubLink(event) {
//   event.preventDefault();
//   window.open('https://github.com/NicolasCanut/damas-client.git', '_blank');
// }


// Funcionalidad de guardar y cargar partida con LocalStorage
function saveGame() {
    const gameState = JSON.stringify({ board: gameBoard, player1Score, player2Score, currentPlayer });
    localStorage.setItem('gameState', gameState);
    alert('Partida guardada exitosamente.');
  }
  
  function loadGame() {
    const savedGameState = localStorage.getItem('gameState');
    if (savedGameState) {
      const { board, player1Score: p1Score, player2Score: p2Score, currentPlayer: currPlayer } = JSON.parse(savedGameState);
      gameBoard = board;
      player1Score = p1Score;
      player2Score = p2Score;
      currentPlayer = currPlayer;
      // Actualizar visualmente la representación del tablero y el marcador de puntaje
      updateScore(0); // Actualizar marcador visual
      const cells = document.querySelectorAll('.cell');
      cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const piece = getPiece(row, col);
        if (piece) {
          const pieceElement = document.createElement('div');
          pieceElement.className = `piece ${piece.color} ${piece.isKing ? 'king' : ''}`;
          cell.appendChild(pieceElement);
        }
      });
      alert('Partida cargada exitosamente.');
    } else {
      alert('No hay partida guardada.');
    }
  }

// Inicialización del juego
document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('start-button');
  startButton.addEventListener('click', startGame);

  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', saveGame);

  const loadButton = document.getElementById('load-button');
  loadButton.addEventListener('click', loadGame);
});


function startGame() {
  console.log('Partida iniciada');
  const player1Name = document.getElementById('player1').value;
  const player2Name = document.getElementById('player2').value;

  if (player1Name && player2Name) {
    document.querySelector('.score').style.display = 'block'; // Mostrar el marcador
    createBoard();
  } else {
    alert('Por favor, ingresa los nombres de los jugadores.');
  }
}


  
  