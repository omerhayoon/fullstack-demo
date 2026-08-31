import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_IMAGES } from '../../data/puzzleImages';

function PuzzleGame({ currentUser, updateUserPoints }) {
  const navigate = useNavigate();

  // 1. כל ה-Hooks חייבים להירשם ראשונים!
  const [pieceCount, setPieceCount] = useState(9);
  const [selectedImageObj, setSelectedImageObj] = useState(
    DEFAULT_IMAGES?.[0] || { url: '', title: 'תמונה' }
  );
  const [isGameStarted, setIsGameStarted] = useState(false);

  const [tiles, setTiles] = useState([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  // ⏱️ State לניהול הטיימר
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // אפקט שמנהל את שמיעת השניות של הטיימר
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  // פורמט תצוגה לזמן (00:00)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 2. בדיקת התחברות
  if (!currentUser) {
    return (
      <div className="page-container">
        <header className="hero-section">
          <h1 className="main-title">🧩 פאזל תמונות</h1>
          <p className="subtitle" style={{ color: '#ff4444' }}>🚫 הגישה חסומה לאורחים</p>
        </header>

        <div className="message-form-container" style={{ textAlign: 'center', padding: '30px', maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>כדי לשחק בפאזל, עליך להתחבר לחשבונך תחילה.</h3>
          <p style={{ color: '#aaa', fontSize: '0.85rem' }}>אנא השתמש בחלונית ההתחברות בצד ימין למעלה.</p>
        </div>
        
        <button onClick={() => navigate('/games')} className="action-button back-btn" style={{ marginTop: '20px' }}>
          🎮 חזרה למרכז המשחקים
        </button>
      </div>
    );
  }

  const username = currentUser.username || currentUser.name || currentUser.email || 'guest';
  const puzzleKey = `puzzle_history_${username}`;

  const getGameConfig = (count) => {
    if (count === 9) return { rows: 3, cols: 3, rewardPoints: 2 };
    if (count === 16) return { rows: 4, cols: 4, rewardPoints: 4 };
    if (count === 25) return { rows: 5, cols: 5, rewardPoints: 6 };
    if (count === 49) return { rows: 7, cols: 7, rewardPoints: 10 };
    return { rows: 3, cols: 3, rewardPoints: 2 };
  };

  const { rows, cols, rewardPoints } = getGameConfig(pieceCount);
  const totalPieces = rows * cols;

  const startNewGame = () => {
    const initialTiles = [];
    for (let i = 0; i < totalPieces; i++) {
      initialTiles.push({
        id: i,
        correctIndex: i,
      });
    }

    let shuffled = [...initialTiles];
    do {
      shuffled = [...shuffled].sort(() => Math.random() - 0.5);
    } while (shuffled.every((tile, idx) => tile.correctIndex === idx));

    setTiles(shuffled);
    setSelectedTileIndex(null);
    setIsCompleted(false);
    setMoveCount(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsGameStarted(true);
  };

  const savePuzzleResult = (timeSpent) => {
    const existingHistory = JSON.parse(localStorage.getItem(puzzleKey)) || [];
    const newRecord = {
      imageThumbnail: selectedImageObj.url,
      imageTitle: selectedImageObj.title || 'פאזל',
      pieceCount: pieceCount,
      timeSpent: formatTime(timeSpent),
      date: new Date().toLocaleDateString('he-IL')
    };
    localStorage.setItem(puzzleKey, JSON.stringify([newRecord, ...existingHistory]));
  };

  const handleTileClick = (index) => {
    if (isCompleted) return;

    if (selectedTileIndex === null) {
      setSelectedTileIndex(index);
    } else if (selectedTileIndex === index) {
      setSelectedTileIndex(null);
    } else {
      if (!isTimerRunning && moveCount === 0) {
        setIsTimerRunning(true);
      }

      const newTiles = [...tiles];
      const temp = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = newTiles[index];
      newTiles[index] = temp;

      setTiles(newTiles);
      setSelectedTileIndex(null);
      const nextMoveCount = moveCount + 1;
      setMoveCount(nextMoveCount);

      const checkWin = newTiles.every((tile, idx) => tile.correctIndex === idx);
      if (checkWin) {
        setIsCompleted(true);
        setIsTimerRunning(false);
        savePuzzleResult(elapsedTime);
        if (updateUserPoints) {
          updateUserPoints(rewardPoints);
        }
      }
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <header className="hero-section" style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 className="main-title" style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>🧩 פאזל תמונות</h1>
        <p className="subtitle" style={{ margin: 0 }}>הרכב את החלקים לקבלת התמונה השלמה</p>
      </header>

      {!isGameStarted ? (
        <div style={{ backgroundColor: '#1a1a1e', padding: '20px', borderRadius: '12px', border: '1px solid #2d2d35', maxWidth: '650px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '1rem' }}>1. בחר רמת קושי:</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { count: 9, label: '9 חלקים (3x3)' },
                { count: 16, label: '16 חלקים (4x4)' },
                { count: 25, label: '25 חלקים (5x5)' },
                { count: 49, label: '49 חלקים (7x7)' }
              ].map((item) => (
                <button
                  key={item.count}
                  onClick={() => setPieceCount(item.count)}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: pieceCount === item.count ? '2px solid #0cf304' : '1px solid #444',
                    backgroundColor: pieceCount === item.count ? 'rgba(12, 243, 4, 0.1)' : '#25252b',
                    color: pieceCount === item.count ? '#0cf304' : '#fff',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '1rem' }}>2. בחר תמונה לפאזל:</h3>
            <div 
              className="no-scrollbar"
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(5, 1fr)', 
                gap: '8px',
                maxHeight: '230px',
                overflowY: 'auto',
                padding: '6px',
                backgroundColor: '#121214',
                borderRadius: '8px',
                border: '1px solid #333'
              }}
            >
              {(DEFAULT_IMAGES || []).map((img) => (
                <div
                  key={img.id || img.url}
                  onClick={() => setSelectedImageObj(img)}
                  style={{
                    cursor: 'pointer',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: selectedImageObj.url === img.url ? '2px solid #0cf304' : '2px solid transparent',
                    height: '75px'
                  }}
                >
                  <img src={img.url} alt={img.title || "Option"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startNewGame}
            className="action-button"
            style={{ width: '100%', padding: '10px', fontSize: '1rem', backgroundColor: '#0cf304', color: '#000', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
          >
            התחל משחק 🚀
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1100px', color: '#aaa', fontSize: '1.1rem' }}>
            <span>זמן רץ: <strong style={{ color: '#fff' }}>{formatTime(elapsedTime)}</strong></span>
            <span>פרס בסיום: <strong style={{ color: '#0cf304' }}>{rewardPoints} נקודות</strong></span>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '30px',
            width: '100%',
            maxWidth: '1100px'
          }}>
            
            <div style={{ flex: '1', maxWidth: '550px', width: '100%' }}>
              <h4 style={{ color: '#fff', textAlign: 'center', marginBottom: '12px', fontSize: '1.2rem' }}>לוח המשחק</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gap: '2px',
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: '#000',
                  padding: '4px',
                  borderRadius: '10px',
                  border: isCompleted ? '4px solid #0cf304' : '2px solid #333',
                  boxSizing: 'border-box',
                  direction: 'ltr'
                }}
              >
                {tiles.map((tile, index) => {
                  const origRow = Math.floor(tile.correctIndex / cols);
                  const origCol = tile.correctIndex % cols;

                  const bgPosX = cols > 1 ? (origCol / (cols - 1)) * 100 : 0;
                  const bgPosY = rows > 1 ? (origRow / (rows - 1)) * 100 : 0;

                  const isSelected = selectedTileIndex === index;

                  return (
                    <div
                      key={index}
                      onClick={() => handleTileClick(index)}
                      style={{
                        backgroundImage: `url(${selectedImageObj.url})`,
                        backgroundSize: `${cols * 100}% ${rows * 100}%`,
                        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                        cursor: 'pointer',
                        borderRadius: '2px',
                        outline: isSelected ? '3px solid #0cf304' : 'none',
                        opacity: isSelected ? 0.7 : 1,
                        transition: 'transform 0.1s, opacity 0.1s',
                        boxShadow: isSelected ? '0 0 10px #0cf304' : 'none'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div style={{ flex: '1', maxWidth: '550px', width: '100%' }}>
              <h4 style={{ color: '#aaa', textAlign: 'center', marginBottom: '12px', fontSize: '1.2rem' }}>תמונה מלאה 👁️</h4>
              <div style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '10px',
                border: '2px dashed #444',
                padding: '4px',
                boxSizing: 'border-box',
                backgroundColor: '#1a1a1e'
              }}>
                <img
                  src={selectedImageObj.url}
                  alt="Target Reference"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    opacity: 0.95
                  }}
                />
              </div>
            </div>

          </div>

          {isCompleted && (
            <div style={{
              backgroundColor: 'rgba(12, 243, 4, 0.15)',
              border: '1px solid #0cf304',
              color: '#0cf304',
              padding: '15px 25px',
              borderRadius: '8px',
              textAlign: 'center',
              width: '100%',
              maxWidth: '1100px',
              marginTop: '15px',
              fontSize: '1.2rem'
            }}>
              🎉 כל הכבוד! הפאזל הושלם בהצלחה בתוך <strong>{formatTime(elapsedTime)}</strong> שניות!
              {updateUserPoints && <div>זכית ב-<strong>{rewardPoints}</strong> נקודות! 🏆</div>}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setIsGameStarted(false);
              }}
              className="action-button"
              style={{ backgroundColor: '#333', color: '#fff', padding: '12px 20px', fontSize: '1rem' }}
            >
              שינוי הגדרות/תמונה ⚙️
            </button>
            <button
              onClick={startNewGame}
              className="action-button"
              style={{ backgroundColor: '#0cf304', color: '#000', padding: '12px 20px', fontSize: '1rem', fontWeight: 'bold' }}
            >
              ערבב מחדש 🔄
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/games')}
        className="action-button back-btn"
        style={{ marginTop: '20px' }}
      >
        חזרה למרכז המשחקים
      </button>
    </div>
  );
}

export default PuzzleGame;