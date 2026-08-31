import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// פונקציית עזר לקריאה בטוחה מ-LocalStorage
const getSafeLocalStorage = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
    return fallback;
  }
};

function Profile({ currentUser, updateUserPoints }) {
  const navigate = useNavigate();

  // זיהוי שם משתמש ויצירת מפתחות ל-LocalStorage
  const username = currentUser?.username || currentUser?.name || currentUser?.email || 'guest';
  const statsKey = `math_stats_${username}`;
  const historyKey = `quiz_history_${username}`;
  const memoryKey = `memory_game_history_${username}`;
  const puzzleKey = `puzzle_history_${username}`;

  // ניהול ה-State
  const [localStats, setLocalStats] = useState(() => 
    getSafeLocalStorage(statsKey, { correctAnswers: 0, wrongAnswers: 0 })
  );
  const [testHistory, setTestHistory] = useState(() => getSafeLocalStorage(historyKey, []));
  const [memoryHistory, setMemoryHistory] = useState(() => getSafeLocalStorage(memoryKey, []));
  const [puzzleHistory, setPuzzleHistory] = useState(() => getSafeLocalStorage(puzzleKey, []));

  const handleBackToHome = () => {
    navigate('/');
  };

  // סגנון אחיד לכרטיסיות היוקרתיות
  const luxuryCardStyle = {
    minHeight: '340px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justify: 'space-between',
    boxSizing: 'border-box',
    background: 'radial-gradient(circle at top left, #1a1a2e 0%, #0f0f1b 100%)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(212, 172, 13, 0.12)',
    border: '1px solid rgba(212, 172, 13, 0.22)'
  };

  if (!currentUser) {
    return (
      <div className="page-container" style={{ paddingBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header className="hero-section" style={{ textAlign: 'center', marginBottom: '25px', paddingTop: '10px' }}>
          <h1 className="main-title" style={{ color: '#ff4444', fontSize: '2.5rem', fontWeight: '900', margin: '0 0 10px 0' }}>
            👤 פרופיל משתמש
          </h1>
          <p style={{ color: '#d0d0e0', fontSize: '1.1rem', margin: 0, fontWeight: '300' }}>
            🚫 הגישה חסומה לאורחים
          </p>
        </header>

        <div 
          className="dash-card" 
          style={{ 
            ...luxuryCardStyle,
            maxWidth: '500px', 
            width: '100%', 
            textAlign: 'center', 
            marginTop: '10px',
            minHeight: 'auto'
          }}
        >
          <h3 style={{ marginBottom: '15px', color: '#fff', lineHeight: '1.5', fontSize: '1.1rem' }}>
            כדי לצפות בפרופיל האישי שלך ולערוך את הגדרות החשבון, עליך להתחבר למערכת תחילה.
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.95rem', margin: 0 }}>
            אנא השתמש בחלונית ההתחברות שבמסך הבית על מנת להיכנס לחשבונך.
          </p>
        </div>
        
        <button 
          onClick={handleBackToHome} 
          style={{ 
            marginTop: '30px', 
            padding: '12px 30px',
            fontSize: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          חזרה למסך הבית
        </button>
      </div>
    );
  }

  // איפוס נתונים כולל
  const handleResetData = async () => {
    const confirmReset = window.confirm("⚠️ אזהרה: האם אתה בטוח שברצונך לאפס את כל הניקוד, הסטטיסטיקות וההיסטוריה שלך? פעולה זו אינה הפיכה!");
    
    if (confirmReset) {
      localStorage.removeItem(statsKey);
      localStorage.removeItem(historyKey);
      localStorage.removeItem(memoryKey);
      localStorage.removeItem(puzzleKey);

      if (updateUserPoints && currentUser.points) {
        await updateUserPoints(-currentUser.points);
      }

      setLocalStats({ correctAnswers: 0, wrongAnswers: 0 });
      setTestHistory([]);
      setMemoryHistory([]);
      setPuzzleHistory([]);

      alert("החשבון אופס בהצלחה!");
    }
  };

  // מחיקת פריט יחיד מרשימת היסטוריה
  const handleDeleteItem = (storageKey, indexToDelete, setStateFn) => {
    setStateFn(prevHistory => {
      const updated = prevHistory.filter((_, idx) => idx !== indexToDelete);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  // חישובי סטטיסטיקה
  const correctCount = localStats.correctAnswers || 0;
  const wrongCount = localStats.wrongAnswers || 0;
  const totalSolved = correctCount + wrongCount;
  const correctPercent = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
  const wrongPercent = totalSolved > 0 ? Math.round((wrongCount / totalSolved) * 100) : 0;

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .custom-dash-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-dash-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-dash-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 172, 13, 0.3);
          border-radius: 10px;
        }
        .custom-dash-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 172, 13, 0.6);
        }

        .luxury-gold-text {
          background: linear-gradient(135deg, #fff6d1 0%, #ffd700 40%, #cca010 70%, #fff1b0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.3));
        }

        .dash-card-header {
          font-size: 1.15rem;
          color: #f39c12;
          margin: 0 0 14px 0;
          font-weight: 700;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(212, 172, 13, 0.2);
          padding-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-shadow: 0 0 10px rgba(243, 156, 18, 0.3);
        }

        .table-row-hover {
          transition: background 0.2s ease;
        }
        .table-row-hover:hover {
          background: rgba(255, 215, 0, 0.05) !important;
        }

        /* גריד 3 כרטיסיות בשורה */
        .profile-grid-3-col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto 35px auto;
        }

        @media (max-width: 992px) {
          .profile-grid-3-col {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 650px) {
          .profile-grid-3-col {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* 👑 כותרת ראשית יוקרתית */}
      <header className="hero-section" style={{ textAlign: 'center', marginBottom: '35px', paddingTop: '10px' }}>
        <h1 className="main-title luxury-gold-text" style={{ 
          fontSize: '2.8rem', 
          fontWeight: '900', 
          margin: '0 0 10px 0',
          letterSpacing: '1px'
        }}>
          פרופיל משתמש ({username})
        </h1>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '12px',
          margin: '0 auto 12px auto',
          maxWidth: '240px'
        }}>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5))', flex: 1 }}></div>
          <span style={{ color: '#ffd700', fontSize: '10px' }}>◆</span>
          <div style={{ height: '1px', background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.5), transparent)', flex: 1 }}></div>
        </div>

        <p style={{ color: '#d0d0e0', fontSize: '1.1rem', margin: 0, fontWeight: '300' }}>
          הישגים, סטטיסטיקות והיסטוריית פעילות אישית
        </p>
      </header>

      {/* גריד חלוניות - 3 בשורה */}
      <div className="profile-grid-3-col">

        {/* 🧠 חלונית 1: הישגי משחק הזיכרון */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">🧠 הישגי משחק הזיכרון</h3>
          <div 
            className="dash-card-content custom-dash-scrollbar" 
            style={{ 
              flex: 1, 
              maxHeight: '280px', 
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              border: '1px solid rgba(212, 172, 13, 0.15)',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            {memoryHistory.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0f0f1b', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid rgba(212, 172, 13, 0.2)' }}>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600' }}>זוגות</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600' }}>זמן</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600' }}>תאריך</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', textAlign: 'center' }}>מחיקה</th>
                  </tr>
                </thead>
                <tbody>
                  {memoryHistory.map((game, index) => (
                    <tr key={index} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '6px 4px', color: '#ffffff', fontWeight: 'bold' }}>{game.pairsCount} זוגות</td>
                      <td style={{ padding: '6px 4px', color: '#0cf304', fontWeight: 'bold' }}>{game.timeSpent}</td>
                      <td style={{ padding: '6px 4px', color: '#aaa' }}>{game.date || 'לא צוין'}</td>
                      <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteItem(memoryKey, index, setMemoryHistory)}
                          title="מחק תוצאה זו"
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '2px 4px'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '25px 10px', color: '#888' }}>
                <p style={{ fontSize: '0.95rem', margin: '0 0 5px 0' }}>🎮 אין עדיין משחקים שנשמרו</p>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>כאשר תסיים משחק זיכרון, התוצאה תופיע כאן.</p>
              </div>
            )}
          </div>
        </div>

        {/* 📈 חלונית 2: סטטיסטיקת תרגילים */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">📈 סטטיסטיקת תרגילים</h3>
          <div className="dash-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center', flex: 1 }}>
            {totalSolved > 0 ? (
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                  <circle className="donut-hole" cx="21" cy="21" r="15.91549430918954" fill="transparent"/>
                  <circle className="donut-ring" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="3.5"/>
                  <circle className="donut-segment-correct" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#0cf304" strokeWidth="4" strokeDasharray={`${correctPercent} ${100 - correctPercent}`} strokeDashoffset="25" />
                  <circle className="donut-segment-wrong" cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="#ff4444" strokeWidth="4" strokeDasharray={`${wrongPercent} ${100 - wrongPercent}`} strokeDashoffset={25 - correctPercent} />
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#ffd700', textShadow: '0 0 10px rgba(255, 215, 0, 0.3)' }}>{correctPercent}%</span>
                  <span style={{ fontSize: '10px', color: '#0cf304', fontWeight: 'bold' }}>הצלחה</span>
                </div>
              </div>
            ) : (
              <div style={{ width: '85px', height: '85px', borderRadius: '50%', border: '2px dashed rgba(212, 172, 13, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '12px', textAlign: 'center' }}>
                אין נתונים
              </div>
            )}

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(212, 172, 13, 0.15)', paddingBottom: '4px' }}>
                <span style={{ color: '#aaa' }}>נפתרו:</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{totalSolved}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>נכונות:</span>
                <span style={{ color: '#0cf304', fontWeight: 'bold' }}>{correctCount} ({correctPercent}%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>שגיאות:</span>
                <span style={{ color: '#ff4444', fontWeight: 'bold' }}>{wrongCount} ({wrongPercent}%)</span>
              </div>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid rgba(212, 172, 13, 0.15)', paddingTop: '10px', textAlign: 'center', marginTop: 'auto' }}>
              <button
                onClick={handleResetData}
                style={{
                  width: '100%',
                  padding: '8px 0',
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  color: '#ff4444',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                🗑️ איפוס נתונים
              </button>
            </div>
          </div>
        </div>

        {/* 📝 חלונית 3: היסטוריית מבחנים */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">📝 היסטוריית מבחנים</h3>
          <div 
            className="dash-card-content custom-dash-scrollbar" 
            style={{ 
              flex: 1, 
              maxHeight: '280px', 
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              border: '1px solid rgba(212, 172, 13, 0.15)',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            {testHistory.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.82rem', tableLayout: 'fixed' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0f0f1b', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid rgba(212, 172, 13, 0.2)' }}>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', width: '28%' }}>מבחן</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', width: '18%' }}>ציון</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', width: '16%' }}>תוצאה</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', width: '16%' }}>זמן</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', width: '22%' }}>תאריך</th>
                    <th style={{ padding: '6px 2px', color: '#ffd700', fontWeight: '600', textAlign: 'center', width: '24px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {testHistory.map((test, index) => (
                    <tr key={index} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '6px 4px', color: '#ffffff', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={test.quizTitle}>
                        {test.quizTitle}
                      </td>
                      <td style={{ padding: '6px 4px', color: '#ffffff', fontWeight: 'bold' }}>
                        {test.correctCount}/{test.totalQuestions}
                      </td>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold', color: test.passed ? '#0cf304' : '#ff4444' }}>
                        {test.passed ? 'עבר' : 'נכשל'}
                      </td>
                      <td style={{ padding: '6px 4px', color: '#aaa', fontSize: '0.78rem' }}>
                        {test.timeSpent}
                      </td>
                      <td style={{ padding: '6px 4px', color: '#aaa', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {test.date}
                      </td>
                      <td style={{ padding: '6px 2px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteItem(historyKey, index, setTestHistory)}
                          title="מחק מבחן זה"
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '25px 10px', color: '#888' }}>
                <p style={{ fontSize: '0.95rem', margin: 0 }}>📋 אין עדיין מבחנים שנשמרו</p>
              </div>
            )}
          </div>
        </div>

        {/* 🧩 חלונית 4: הישגי פאזלים */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">🧩 הישגי פאזלים</h3>
          <div 
            className="dash-card-content custom-dash-scrollbar" 
            style={{ 
              flex: 1, 
              maxHeight: '280px', 
              overflowY: 'auto',
              overflowX: 'hidden',
              width: '100%',
              border: '1px solid rgba(212, 172, 13, 0.15)',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 0, 0, 0.2)'
            }}
          >
            {puzzleHistory.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.82rem', tableLayout: 'fixed' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0f0f1b', zIndex: 1 }}>
                  <tr style={{ borderBottom: '1px solid rgba(212, 172, 13, 0.2)' }}>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600', width: '32px' }}>תמונה</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600' }}>חלקים</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600' }}>זמן</th>
                    <th style={{ padding: '6px 4px', color: '#ffd700', fontWeight: '600' }}>תאריך</th>
                    <th style={{ padding: '6px 2px', color: '#ffd700', fontWeight: '600', textAlign: 'center', width: '24px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {puzzleHistory.map((item, index) => (
                    <tr key={index} className="table-row-hover" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ padding: '6px 4px', verticalAlign: 'middle' }}>
                        {item.imageThumbnail ? (
                          <img 
                            src={item.imageThumbnail} 
                            alt="puzzle" 
                            style={{ width: '24px', height: '24px', objectFit: 'cover', borderRadius: '4px', verticalAlign: 'middle', border: '1px solid rgba(212, 172, 13, 0.3)' }} 
                          />
                        ) : (
                          <span style={{ color: '#fff' }}>🧩</span>
                        )}
                      </td>
                      <td style={{ padding: '6px 4px', color: '#ffffff', fontWeight: 'bold' }}>
                        {item.pieceCount} חלקים
                      </td>
                      <td style={{ padding: '6px 4px', color: '#0cf304', fontWeight: 'bold' }}>
                        {item.timeSpent}
                      </td>
                      <td style={{ padding: '6px 4px', color: '#aaa', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.date || 'לא צוין'}
                      </td>
                      <td style={{ padding: '6px 2px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleDeleteItem(puzzleKey, index, setPuzzleHistory)}
                          title="מחק פאזל זה"
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            padding: '0'
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '25px 10px', color: '#888' }}>
                <p style={{ fontSize: '0.95rem', margin: '0 0 5px 0' }}>🧩 אין עדיין פאזלים שנפתרו</p>
                <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>כאשר תסיים לפתור פאזל, התוצאה תופיע כאן.</p>
              </div>
            )}
          </div>
        </div>

        {/* 📌 חלונית 5 */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">📌 כרטיסייה 5</h3>
          <div 
            className="dash-card-content" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              flex: 1,
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#ffd700', margin: '0 0 5px 0' }}>המשך יבוא...</p>
            <p style={{ fontSize: '0.85rem', color: '#aaa', margin: 0 }}>תוכן כרטיסייה זו יתווסף בהמשך</p>
          </div>
        </div>

        {/* 📌 חלונית 6 */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">📌 כרטיסייה 6</h3>
          <div 
            className="dash-card-content" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              flex: 1,
              textAlign: 'center'
            }}
          >
            <p style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#ffd700', margin: '0 0 5px 0' }}>המשך יבוא...</p>
            <p style={{ fontSize: '0.85rem', color: '#aaa', margin: 0 }}>תוכן כרטיסייה זו יתווסף בהמשך</p>
          </div>
        </div>

      </div>

      {/* כפתור חזרה למסך הבית */}
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handleBackToHome} 
          style={{
            padding: '12px 30px',
            fontSize: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          חזרה למסך הבית
        </button>
      </div>
    </div>
  );
}

export default Profile;