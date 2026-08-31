import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ messages = [] }) {
  const navigate = useNavigate();
  
  // סטייט לסימולציה של מהירות אינטרנט
  const [speed, setSpeed] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // סטייטים עבור נתוני המשתמשים מהשרת
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // משיכת כל המשתמשים מהשרת עם עליית הרכיב
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/users/all');
        if (response.ok) {
          const data = await response.json();
          setUsersList(data);
        } else {
          console.error('Failed to fetch users from server');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  const checkInternetSpeed = () => {
    setIsLoading(true);
    setSpeed(null);
    
    setTimeout(() => {
      const randomSpeed = Math.floor(Math.random() * (950 - 200 + 1)) + 200;
      setSpeed(randomSpeed);
      setIsLoading(false);
    }, 1500);
  };

  // 🏆 חישוב כל המשתמשים ממוינים לפי נקודות (ללא הגבלה ל-3)
  const getSortedUsersByPoints = () => {
    return [...usersList]
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  };

  const sortedUsers = getSortedUsersByPoints();

  // סגנון עיצוב אחיד ויוקרתי לכרטיסיות בדשבורד
  const luxuryCardStyle = {
    minHeight: '260px',
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

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      {/* תגית style להגדרת אפקטים טיפוגרפיים וסרגל גלילה */}
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

        .leader-row {
          transition: all 0.25s ease;
        }
        .leader-row:hover {
          background: rgba(255, 215, 0, 0.06) !important;
          transform: translateX(-3px);
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
          מדדים וסטטיסטיקה
        </h1>

        {/* מפריד מוזהב דקורטיבי */}
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
          נתוני מערכת ודירוגי משתמשים בזמן אמת
        </p>
      </header>

      {/* גריד חלוניות */}
      <div className="dashboard-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        maxWidth: '960px',
        margin: '0 auto 35px auto'
      }}>
        
        {/* ⚡ חלונית 1: מהירות אינטרנט */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">⚡ מהירות אינטרנט</h3>
          <div className="dash-card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '15px' }}>
            {isLoading ? (
              <div style={{ color: '#ffd700', fontSize: '1.05rem', fontWeight: '500' }}>
                בודק מהירות תקשורת... 🔄
              </div>
            ) : speed ? (
              <div className="speed-result" style={{ textAlign: 'center' }}>
                <span className="speed-number" style={{ 
                  fontSize: '3.2rem', 
                  fontWeight: '900', 
                  color: '#0cf304',
                  textShadow: '0 0 20px rgba(12, 243, 4, 0.4)'
                }}>{speed}</span>
                <span className="speed-unit" style={{ fontSize: '1.1rem', color: '#aaa', marginRight: '6px' }}>Mbps</span>
              </div>
            ) : (
              <p className="dash-placeholder" style={{ color: '#888', margin: 0, fontSize: '0.95rem' }}>
                לחץ על הכפתור למטה להתחלת בדיקת מהירות
              </p>
            )}

            <button 
              onClick={checkInternetSpeed} 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: isLoading ? '#2a2a38' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                color: isLoading ? '#666' : '#fff',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: isLoading ? 'none' : '0 4px 15px rgba(0, 123, 255, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: 'auto'
              }}
            >
              {speed ? 'בדוק שוב 🔄' : 'בדוק מהירות עכשיו 🚀'}
            </button>
          </div>
        </div>

        {/* 📬 חלונית 2: סה"כ הודעות בלוח */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">📬 סה"כ הודעות בלוח</h3>
          <div className="dash-card-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <span className="counter-number" style={{ 
              fontSize: '3.8rem', 
              fontWeight: '900', 
              color: '#ffd700',
              textShadow: '0 0 25px rgba(255, 215, 0, 0.4)',
              lineHeight: 1
            }}>
              {messages.length}
            </span>
            <span style={{ color: '#aaa', fontSize: '0.9rem', marginTop: '12px' }}>
              הודעות פעילות בלוח המודעות
            </span>
          </div>
        </div>

        {/* 👥 חלונית 3: משתמשים רשומים במערכת */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">👥 משתמשים רשומים במערכת</h3>
          <div className="dash-card-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', color: '#ffd700', margin: 'auto' }}>
                טוען נתוני משתמשים... 🔄
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', justifyContent: 'center', marginBottom: '4px' }}>
                  <span className="counter-number" style={{ fontSize: '2.2rem', color: '#0cf304', fontWeight: 'bold', textShadow: '0 0 15px rgba(12, 243, 4, 0.3)' }}>
                    {usersList.length}
                  </span>
                  <span style={{ color: '#aaa', fontSize: '0.9rem' }}>משתמשים פעילים</span>
                </div>
                
                <div className="custom-dash-scrollbar" style={{ 
                  flex: 1, 
                  maxHeight: '135px', 
                  overflowY: 'auto', 
                  width: '100%',
                  border: '1px solid rgba(212, 172, 13, 0.15)',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(212, 172, 13, 0.08)', textAlign: 'right' }}>
                        <th style={{ padding: '8px 12px', color: '#ffd700', fontWeight: '600', borderBottom: '1px solid rgba(212, 172, 13, 0.15)' }}>תג</th>
                        <th style={{ padding: '8px 12px', color: '#ffd700', fontWeight: '600', borderBottom: '1px solid rgba(212, 172, 13, 0.15)' }}>שם משתמש</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>אין משתמשים במערכת</td>
                        </tr>
                      ) : (
                        usersList.map((u) => (
                          <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 215, 0, 0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '6px 12px', fontSize: '1.1rem' }}>{u.activeBadge || '👤'}</td>
                            <td style={{ padding: '6px 12px', color: '#e0e0e0', fontWeight: '500' }}>{u.username}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 🏆 חלונית 4: טבלת מובילי הניקוד (כולל גלילה נסתרת) */}
        <div className="dash-card" style={luxuryCardStyle}>
          <h3 className="dash-card-header">📈 מובילי הניקוד במערכת</h3>
          <div className="dash-card-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', flex: 1, overflow: 'hidden' }}>
            {isLoadingUsers ? (
              <div style={{ textAlign: 'center', color: '#ffd700', margin: 'auto' }}>
                טוען אלופים... 🔄
              </div>
            ) : sortedUsers.length === 0 ? (
              <p className="dash-placeholder" style={{ color: '#888', textAlign: 'center', margin: 'auto' }}>אין נתוני משתמשים כרגע</p>
            ) : (
              <div 
                className="leaderboard-list hide-scrollbar" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '10px', 
                  width: '100%',
                  maxHeight: '170px',
                  overflowY: 'auto'
                }}
              >
                {sortedUsers.map((user, index) => (
                  <div 
                    key={user.id || user.username} 
                    className="leader-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(212, 172, 13, 0.12)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                      <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.95rem' }}>
                        {user.username}
                      </span>
                    </div>

                    <span style={{ 
                      color: '#0cf304', 
                      fontWeight: '800', 
                      fontSize: '1rem',
                      textShadow: '0 0 8px rgba(12, 243, 4, 0.3)',
                      background: 'rgba(12, 243, 4, 0.1)',
                      padding: '2px 10px',
                      borderRadius: '10px',
                      border: '1px solid rgba(12, 243, 4, 0.2)'
                    }}>
                      {user.points || 0} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>נק'</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* כפתור חזרה למסך הבית */}
      <div style={{ textAlign: 'center' }}>
        <button 
          onClick={handleBackToHome} 
          className="action-button back-btn"
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

export default Dashboard;