import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPlay } from 'react-icons/fa';

// הגדרות טטריס
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
// צורות הבלוקים (Tetrominoes) + 3 צורות חדשות!
const TETROMINOES = {
  I: { shape: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]], color: '#00f0f0' },
  J: { shape: [[0, 1, 0], [0, 1, 0], [1, 1, 0]], color: '#0000f0' },
  L: { shape: [[0, 1, 0], [0, 1, 0], [0, 1, 1]], color: '#f0a000' },
  
  O: { shape: [[1, 1], [1, 1]], color: '#f0f000' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#00f0f0' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#a000f0' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#f00000' },

  // 📍 3 צורות חדשות:
  P: { shape: [[1]], color: '#ec4899' }, // נקודה בודדת (Dot) - ורוד
  X: { shape: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], color: '#10b981' }, // פלוס / צלב - ירוק מנטה
  U: { shape: [[1, 0], [1, 1]], color: '#f97316' } // פינה קטנה / ר' קטנה - כתום תפוז
};

const RANDOM_TETROMINO = () => {
  // הוספנו את המפתחות P, X, U למחרוזת
  const keys = 'IJLOSTZPXU';
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOES[randKey];
};

const createEmptyBoard = () =>
  Array.from(Array(BOARD_HEIGHT), () => Array(BOARD_WIDTH).fill(0));

function TetrisGame({ onBack, updateUserPoints }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  // מיקום הבלוק הנוכחי והבא
  const [currentPiece, setCurrentPiece] = useState(null);
  const [nextPiece, setNextPiece] = useState(null);
  const [piecePos, setPiecePos] = useState({ x: 0, y: 0 });

  const gameLoopRef = useRef(null);

  // בדיקת התנגשות
  const checkCollision = useCallback((piece, pos, currentBoard) => {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] !== 0) {
          const newX = pos.x + c;
          const newY = pos.y + r;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          if (newY >= 0 && currentBoard[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // התחלת משחק חדש
  const startTetrisGame = () => {
    const firstPiece = RANDOM_TETROMINO();
    const secondPiece = RANDOM_TETROMINO();

    setBoard(createEmptyBoard());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setGameStarted(true);

    setCurrentPiece(firstPiece);
    setNextPiece(secondPiece);
    setPiecePos({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
  };

  // סיבוב הבלוק
  const rotateMatrix = (matrix) => {
    return matrix[0].map((_, index) => matrix.map(col => col[index]).reverse());
  };

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver || !gameStarted) return;

    const rotatedShape = rotateMatrix(currentPiece.shape);
    const rotatedPiece = { ...currentPiece, shape: rotatedShape };

    if (!checkCollision(rotatedPiece, piecePos, board)) {
      setCurrentPiece(rotatedPiece);
    }
  }, [currentPiece, gameOver, gameStarted, checkCollision, piecePos, board]);

  // קיבוע הבלוק בלוח ובדיקת שורות
  const lockPiece = useCallback(() => {
    const newBoard = board.map(row => [...row]);

    for (let r = 0; r < currentPiece.shape.length; r++) {
      for (let c = 0; c < currentPiece.shape[r].length; c++) {
        if (currentPiece.shape[r][c] !== 0) {
          const boardY = piecePos.y + r;
          const boardX = piecePos.x + c;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = currentPiece.color;
          }
        }
      }
    }

    let clearedLines = 0;
    const filteredBoard = newBoard.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredBoard.length < BOARD_HEIGHT) {
      filteredBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }

    if (clearedLines > 0) {
      // 10 נקודות לכל שורה שהושלמה * הרמה הנוכחית
      const addedPoints = clearedLines * 10 * level;
      
      setScore(prev => prev + addedPoints);
      setLines(prev => {
        const newTotal = prev + clearedLines;
        
        // 📍 שינוי 1: הרמה עולה כל 2 שורות שנמחקו
        setLevel(Math.floor(newTotal / 2) + 1);
        
        return newTotal;
      });

      if (updateUserPoints) {
        updateUserPoints(addedPoints);
      }
    }

    setBoard(filteredBoard);

    const nextSpawnPos = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
    if (checkCollision(nextPiece, nextSpawnPos, filteredBoard)) {
      setGameOver(true);
    } else {
      setCurrentPiece(nextPiece);
      setNextPiece(RANDOM_TETROMINO());
      setPiecePos(nextSpawnPos);
    }
  }, [board, currentPiece, nextPiece, piecePos, level, updateUserPoints, checkCollision]);

  // הורדת הבלוק למטה
  const dropPiece = useCallback(() => {
    if (gameOver || !gameStarted || !currentPiece) return;

    const nextPos = { ...piecePos, y: piecePos.y + 1 };
    if (!checkCollision(currentPiece, nextPos, board)) {
      setPiecePos(nextPos);
    } else {
      lockPiece();
    }
  }, [currentPiece, piecePos, board, gameOver, gameStarted, checkCollision, lockPiece]);

  // תנועה אופקית
  const moveHorizontal = useCallback((dir) => {
    if (!currentPiece || gameOver || !gameStarted) return;

    const nextPos = { ...piecePos, x: piecePos.x + dir };
    if (!checkCollision(currentPiece, nextPos, board)) {
      setPiecePos(nextPos);
    }
  }, [currentPiece, gameOver, gameStarted, piecePos, checkCollision, board]);

  // 📍 שינוי 2: לולאת המשחק - המהירות מואצת בכל עליית רמה
  useEffect(() => {
    if (!gameStarted || gameOver || !currentPiece) return;

    // מתחיל ב-800ms, יורד ב-50ms בכל רמה (כלומר כל 2 שורות), עד למינימום של 60ms
    const speed = Math.max(60, 800 - (level - 1) * 50);

    gameLoopRef.current = setInterval(() => {
      dropPiece();
    }, speed);

    return () => clearInterval(gameLoopRef.current);
  }, [gameStarted, dropPiece, gameOver, level, currentPiece]);

  // האזנה למקלדת
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveHorizontal(-1); 
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveHorizontal(1);  
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        dropPiece();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        rotatePiece();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, moveHorizontal, dropPiece, rotatePiece]);

  // רינדור לוח המשחק
  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);

    if (currentPiece && !gameOver && gameStarted) {
      for (let r = 0; r < currentPiece.shape.length; r++) {
        for (let c = 0; c < currentPiece.shape[r].length; c++) {
          if (currentPiece.shape[r][c] !== 0) {
            const y = piecePos.y + r;
            const x = piecePos.x + c;
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              displayBoard[y][x] = currentPiece.color;
            }
          }
        }
      }
    }

    return displayBoard;
  };

  const displayBoard = renderBoard();

  return (
    <div className="page-container" style={{ maxWidth: '850px', margin: '0 auto', padding: '20px', color: '#fff', textAlign: 'center', direction: 'rtl' }}>
      <h1 style={{ marginBottom: '10px' }}>🕹️ טטריס קלאסי</h1>

      {!gameStarted ? (
        <div style={{
          backgroundColor: '#1b2a47',
          borderRadius: '16px',
          border: '4px solid #2d4263',
          padding: '40px 20px',
          marginTop: '30px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <h2>מוכן לשחק?</h2>
          <p style={{ color: '#aaa', maxWidth: '400px', lineHeight: '1.6' }}>
            השתמש במקשי החצים במקלדת כדי לשלוט במשחק:<br />
            <strong>⬆️ חץ למעלה:</strong> סיבוב הבלוק<br />
            <strong>⬅️ חץ שמאלה:</strong> הזזה שמאלה<br />
            <strong>➡️ חץ ימינה:</strong> הזזה ימינה<br />
            <strong>⬇️ חץ למטה:</strong> ירידה מהירה
          </p>
          <button
            onClick={startTetrisGame}
            style={{
              backgroundColor: '#0cf304',
              color: '#000',
              border: 'none',
              padding: '16px 40px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              borderRadius: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 4px 15px rgba(12, 243, 4, 0.4)'
            }}
          >
            <FaPlay /> התחל משחק
          </button>

          <button
            onClick={onBack}
            style={{
              backgroundColor: 'transparent',
              color: '#888',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
              textDecoration: 'underline'
            }}
          >
            חזרה למרכז המשחקים
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: '#aaa', marginBottom: '20px', fontSize: '0.9rem' }}>
            ⬆️ סובב | ⬅️➡️ תנועה | ⬇️ להוריד
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            backgroundColor: '#1b2a47',
            borderRadius: '16px',
            border: '4px solid #2d4263',
            padding: '20px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            marginBottom: '20px',
            flexWrap: 'wrap'
          }}>
            {/* לוח המשחק */}
            <div style={{
              display: 'grid',
              gridTemplateRows: `repeat(${BOARD_HEIGHT}, 24px)`,
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, 24px)`,
              gap: '1px',
              backgroundColor: '#0f172a',
              border: '3px solid #334155',
              borderRadius: '6px',
              padding: '2px',
              direction: 'ltr'
            }}>
              {displayBoard.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      backgroundColor: cell || '#1e293b',
                      borderRadius: '2px',
                      boxShadow: cell ? 'inset 0 0 4px rgba(255,255,255,0.4)' : 'none'
                    }}
                  />
                ))
              )}
            </div>

            {/* לוח ניקוד ונתונים */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '160px', textAlign: 'right' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>ניקוד</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0cf304' }}>{score}</div>
                
                <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '10px' }}>שורות שנמחקו</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{lines}</div>

                <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '10px' }}>רמה (עולה כל 2 שורות)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15' }}>{level}</div>
              </div>

              {/* הקובייה הבאה */}
              <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '10px' }}>הבא בתור:</div>
                <div style={{ display: 'inline-block', direction: 'ltr' }}>
                  {nextPiece && nextPiece.shape.map((row, r) => (
                    <div key={r} style={{ display: 'flex' }}>
                      {row.map((cell, c) => (
                        <div
                          key={c}
                          style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: cell ? nextPiece.color : 'transparent',
                            margin: '1px'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {gameOver && (
                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center' }}>
                  💥 המשחק הסתיים!
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
            <button
              onClick={startTetrisGame}
              style={{
                backgroundColor: '#0cf304',
                color: '#000',
                border: 'none',
                padding: '12px 28px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              משחק חדש
            </button>

            <button
              onClick={onBack}
              style={{
                backgroundColor: 'transparent',
                color: '#888',
                border: '1px solid #444',
                padding: '12px 28px',
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              חזרה למרכז המשחקים
            </button>
          </div>
        </>
      )}
    </div>
    
  );
}

export default TetrisGame;