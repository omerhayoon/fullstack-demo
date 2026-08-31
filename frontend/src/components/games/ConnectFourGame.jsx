import React, { useState } from 'react';

const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const PLAYER1 = 'YELLOW';
const PLAYER2 = 'RED';

function ConnectFourGame({ onBack }) {
  const createEmptyBoard = () => Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));

  const [board, setBoard] = useState(createEmptyBoard());
  const [turn, setTurn] = useState(PLAYER1);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);

  // בדיקת ניצחון בלוח
  const checkWin = (grid, player) => {
    // 1. אופקי
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          grid[r][c] === player &&
          grid[r][c + 1] === player &&
          grid[r][c + 2] === player &&
          grid[r][c + 3] === player
        ) return [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]];
      }
    }
    // 2. אנכי
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        if (
          grid[r][c] === player &&
          grid[r + 1][c] === player &&
          grid[r + 2][c] === player &&
          grid[r + 3][c] === player
        ) return [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]];
      }
    }
    // 3. אלכסון יורד
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          grid[r][c] === player &&
          grid[r + 1][c + 1] === player &&
          grid[r + 2][c + 2] === player &&
          grid[r + 3][c + 3] === player
        ) return [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]];
      }
    }
    // 4. אלכסון עולה
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          grid[r][c] === player &&
          grid[r - 1][c + 1] === player &&
          grid[r - 2][c + 2] === player &&
          grid[r - 3][c + 3] === player
        ) return [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]];
      }
    }
    return null;
  };

  const isBoardFull = (grid) => {
    return grid[0].every(cell => cell !== EMPTY);
  };

  const handleColumnClick = (colIndex) => {
    if (winner || board[0][colIndex] !== EMPTY) return;

    let targetRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][colIndex] === EMPTY) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[targetRow][colIndex] = turn;
    setBoard(newBoard);

    const winPattern = checkWin(newBoard, turn);
    if (winPattern) {
      setWinner(turn);
      setWinningCells(winPattern);
      return;
    }

    if (isBoardFull(newBoard)) {
      setWinner('DRAW');
      return;
    }

    setTurn(prev => (prev === PLAYER1 ? PLAYER2 : PLAYER1));
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setTurn(PLAYER1);
    setWinner(null);
    setWinningCells([]);
  };

  const isWinningCell = (r, c) => {
    return winningCells.some(([winR, winC]) => winR === r && winC === c);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box',
      background: 'radial-gradient(circle at center, #141824 0%, #090b10 100%)',
      color: '#e2e8f0',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    title: {
      fontSize: '2.4rem',
      fontWeight: '700',
      letterSpacing: '4px',
      color: '#f8fafc',
      marginBottom: '15px',
      textTransform: 'uppercase',
      textShadow: '0 4px 12px rgba(0,0,0,0.5)'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      maxWidth: '520px',
      width: '100%'
    },
    statusText: {
      fontSize: '1rem',
      letterSpacing: '1px',
      fontWeight: '600'
    },
    btnSecondary: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      fontSize: '0.85rem',
      cursor: 'pointer',
      letterSpacing: '1px'
    },
    boardContainer: {
      background: '#0d1017',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      display: 'inline-block'
    },
    boardGrid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gap: '12px'
    },
    colHeader: {
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      color: '#475569',
      fontSize: '0.75rem',
      transition: 'all 0.2s'
    },
    cell: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: '#161b26',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 4px 8px rgba(0, 0, 0, 0.8), 0 1px 0 rgba(255,255,255,0.03)',
      position: 'relative'
    },
    discYellow: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #fef08a, #eab308 60%, #a16207)',
      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.4), inset 0 -2px 4px rgba(0,0,0,0.4)',
      animation: 'dropAnim 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
    },
    discRed: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #fca5a5, #ef4444 60%, #991b1b)',
      boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 -2px 4px rgba(0,0,0,0.5)',
      animation: 'dropAnim 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
    },
    btnReset: {
      marginTop: '25px',
      padding: '12px 28px',
      fontSize: '0.95rem',
      fontWeight: '600',
      letterSpacing: '1px',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
      color: '#090b10',
      cursor: 'pointer',
      boxShadow: '0 10px 25px rgba(234, 179, 8, 0.25)'
    }
  };

  return (
    <div style={styles.container}>
      {/* כותרת באנגלית */}
      <h1 style={styles.title}>CONNECT FOUR</h1>

      {/* סרגל עליון */}
      <div style={styles.topBar}>
        {onBack ? (
          <button onClick={onBack} style={styles.btnSecondary}>
            ← Back
          </button>
        ) : <div />}

        <div style={styles.statusText}>
          {winner ? (
            <span style={{ color: winner === PLAYER1 ? '#eab308' : winner === PLAYER2 ? '#ef4444' : '#64748b' }}>
              {winner === 'DRAW'
                ? 'It\'s a Draw!'
                : winner === PLAYER1
                ? 'Yellow Player Wins'
                : 'Red Player Wins'}
            </span>
          ) : (
            <span style={{ color: turn === PLAYER1 ? '#eab308' : '#ef4444' }}>
              Turn: {turn === PLAYER1 ? 'Yellow' : 'Red'}
            </span>
          )}
        </div>
      </div>

      {/* לוח המשחק */}
      <div style={styles.boardContainer}>
        <div style={styles.boardGrid}>
          {Array(COLS).fill(null).map((_, colIdx) => (
            <div
              key={`col-header-${colIdx}`}
              style={{
                ...styles.colHeader,
                opacity: winner ? 0.2 : 1
              }}
              onClick={() => handleColumnClick(colIdx)}
            >
              ▼
            </div>
          ))}

          {board.map((row, rIdx) =>
            row.map((cell, cIdx) => {
              const isWin = isWinningCell(rIdx, cIdx);
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{
                    ...styles.cell,
                    cursor: winner ? 'default' : 'pointer',
                    border: isWin ? '2px solid #ffffff' : 'none',
                    boxShadow: isWin ? '0 0 20px rgba(255, 255, 255, 0.8)' : styles.cell.boxShadow
                  }}
                  onClick={() => handleColumnClick(cIdx)}
                >
                  {cell === PLAYER1 && <div style={styles.discYellow} />}
                  {cell === PLAYER2 && <div style={styles.discRed} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* כפתור איפוס משחק */}
      <button onClick={resetGame} style={styles.btnReset}>
        New Game
      </button>

      <style>{`
        @keyframes dropAnim {
          0% { transform: translateY(-40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default ConnectFourGame;