import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// רשימת האייקונים לכרטיסים
const INITIAL_ICONS = ['🍎', '🍌', '🍒', '🍕', '⚽', '🚗', '🚀', '🎸', '🐶', '🦄', '🍔', '🌮'];

function MemoryGame({ currentUser }) {
  const navigate = useNavigate();

  const [pairsCount, setPairsCount] = useState(6); // ברירת מחדל: 6 זוגות
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false); // האם התבצעה לחיצה ראשונה
  const [isGameOver, setIsGameOver] = useState(false);

  const handleBackToHome = () => {
    navigate('/');
  };

  // אתחול משחק חדש
  const startNewGame = useCallback((selectedPairs = pairsCount) => {
    const iconsToUse = INITIAL_ICONS.slice(0, selectedPairs);
    const duplicatedCards = [...iconsToUse, ...iconsToUse];
    
    // ערבוב הקלפים
    const shuffledCards = duplicatedCards
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon }));

    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedPairs([]);
    setTimer(0);
    setIsGameStarted(false); // הטיימר לא יתחיל עד לחיצה ראשונה
    setIsGameOver(false);
  }, [pairsCount]);

  // טעינה ראשונית ועדכון בעת שינוי כמות הזוגות
  useEffect(() => {
    if (currentUser && currentUser.name) {
      startNewGame(pairsCount);
    }
  }, [pairsCount, startNewGame, currentUser]);

  // ניהול הטיימר - רץ רק כשהמשחק התחיל פעיל וטרם הסתיים
  useEffect(() => {
    let interval = null;
    if (isGameStarted && !isGameOver) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isGameOver]);

  // פורמט זמן MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // הפיכת כרטיס
  const handleCardClick = (index) => {
    if (isGameOver) return;
    if (flippedIndices.length === 2) return;
    if (flippedIndices.includes(index) || matchedPairs.includes(cards[index].icon)) return;

    // התחלת הטיימר בלחיצה הראשונה בלבד
    if (!isGameStarted) {
      setIsGameStarted(true);
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [firstIndex, secondIndex] = newFlipped;
      
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        const newMatched = [...matchedPairs, cards[firstIndex].icon];
        setMatchedPairs(newMatched);
        setFlippedIndices([]);

        if (newMatched.length === pairsCount) {
          handleWin();
        }
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // טיפול בניצחון ושמירת נתונים
  const handleWin = () => {
    setIsGameOver(true);

    if (currentUser) {
      const username = currentUser.username || currentUser.name || currentUser.email || 'guest';
      const memoryKey = `memory_game_history_${username}`;
      const existingHistory = JSON.parse(localStorage.getItem(memoryKey)) || [];

      const newRecord = {
        pairsCount: pairsCount,
        timeSpent: formatTime(timer + 1),
        date: new Date().toLocaleDateString('he-IL')
      };

      const updatedHistory = [newRecord, ...existingHistory];
      localStorage.setItem(memoryKey, JSON.stringify(updatedHistory));
    }
  };

  // 🔒 חסימת אורחים
  if (!currentUser || !currentUser.name) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header className="hero-section" style={{ width: '100%', textAlign: 'center' }}>
          <h1 className="main-title">🧠 משחק הזיכרון</h1>
          <p className="subtitle" style={{ color: '#ff4444' }}>🚫 הגישה חסומה לאורחים</p>
        </header>

        <div className="dash-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '35px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#fff', lineHeight: '1.5' }}>
            כדי לשחק במשחק הזיכרון, להתחרות על שיאים ולשמור את התוצאות שלך, עליך להתחבר למערכת תחילה.
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.95rem' }}>
            אנא השתמש בחלונית ההתחברות שבמסך הבית על מנת להיכנס לחשבונך.
          </p>
        </div>
        
        <button onClick={handleBackToHome} className="action-button back-btn" style={{ marginTop: '30px', width: '200px' }}>
          חזרה למסך הבית
        </button>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <header className="hero-section">
        <h1 className="main-title">🧠 משחק הזיכרון</h1>
        <p className="subtitle">מצא את כל הזוגות בזמן הקצר ביותר!</p>
      </header>

      {/* סרגל שליטה וטיימר */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', margin: '20px 0', flexWrap: 'wrap' }}>
        <div>
          <label style={{ color: '#aaa', marginLeft: '8px' }}>כמות זוגות: </label>
          <select 
            value={pairsCount} 
            onChange={(e) => {
              const count = Number(e.target.value);
              setPairsCount(count); // יעדכן את State ויפעיל את האפקט מידית
            }}
            style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
          >
            <option value={4}>4 זוגות</option>
            <option value={6}>6 זוגות</option>
            <option value={8}>8 זוגות</option>
            <option value={10}>10 זוגות</option>
            <option value={12}>12 זוגות</option>
          </select>
        </div>

        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0cf304', backgroundColor: '#111', padding: '6px 16px', borderRadius: '8px', border: '1px solid #333' }}>
          ⏱️ זמן: {formatTime(timer)}
        </div>

        <button 
          onClick={() => startNewGame(pairsCount)}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🔄 משחק חדש
        </button>
      </div>

      {/* לוח המשחק */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(80px, 1fr))`,
          gap: '12px',
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          border: '1px solid #333'
        }}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || matchedPairs.includes(card.icon);
          
          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              style={{
                height: '90px',
                backgroundColor: isFlipped ? '#2a2a2a' : '#007bff',
                border: isFlipped ? '2px solid #555' : '2px solid #0056b3',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isFlipped ? '2.5rem' : '1.5rem',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'transform 0.2s, background-color 0.2s',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {isFlipped ? card.icon : '❓'}
            </div>
          );
        })}
      </div>

      {/* חלונית סיום/ניצחון */}
      {isGameOver && (
        <div style={{ marginTop: '25px', padding: '20px', backgroundColor: '#1b3a1e', border: '2px solid #4caf50', borderRadius: '10px', display: 'inline-block' }}>
          <h2 style={{ color: '#4caf50', marginBottom: '10px' }}>🎉 כל הכבוד! כל הכרטיסים נמצאו!</h2>
          <p style={{ color: '#fff', fontSize: '1.1rem' }}>סיימת את המשחק תוך <strong>{formatTime(timer)}</strong>!</p>
          <p style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '5px' }}>התוצאה נשמרה בפרופיל האישי שלך.</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <button onClick={handleBackToHome} className="action-button back-btn">
          חזרה למסך הבית
        </button>
      </div>
    </div>
  );
}

export default MemoryGame;