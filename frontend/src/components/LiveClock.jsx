import React, { useState, useEffect, useRef } from 'react';
import { AiFillAudio } from 'react-icons/ai';

function LiveClock({ isPlaying, toggleMusic, tracks, currentTrackUrl, onSelectTrack }) {
  const [dateTime, setDateTime] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // סגירת חלונית המוזיקה אם לוחצים מחוץ לשעון
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formattedDate = dateTime.toLocaleDateString('he-IL', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formattedTime = dateTime.toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div 
      className="live-datetime" 
      ref={menuRef}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '15px',
        position: 'relative', 
      }}
    >
      {/* מימין: תצוגת התאריך והשעה */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span className="live-date">{formattedDate}</span>
        <span className="live-time">{formattedTime}</span>
      </div>

      {/* משמאל: אזור כפתור הרמקול וחלונית הבחירה */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button 
          onClick={toggleMusic}
          title={isPlaying ? "השתק מוזיקה" : "הפעל מוזיקה"}
          style={{
            background: 'none',
            border: 'none',
            color: isPlaying ? '#4caf50' : '#f44336', 
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            transition: 'color 0.3s, transform 0.2s',
            filter: isPlaying ? 'drop-shadow(0 0 4px rgba(76, 175, 80, 0.4))' : 'drop-shadow(0 0 4px rgba(244, 67, 54, 0.4))'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <AiFillAudio />
        </button>

        {/* חץ קטן ליד הרמקול שפותח את חלונית בחירת השירים */}
        <span 
          onClick={() => setShowMenu(!showMenu)}
          title="בחר מוזיקת רקע"
          style={{
            fontSize: '12px',
            color: '#aaa',
            cursor: 'pointer',
            padding: '2px 4px',
            userSelect: 'none',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.color = '#fff'}
          onMouseLeave={(e) => e.target.style.color = '#aaa'}
        >
          {showMenu ? '▲' : '▼'}
        </span>

        {/* 📋 חלונית קטנה לבחירת סוג המוזיקה (Dropdown) */}
        {showMenu && (
          <div style={{
            position: 'absolute',
            top: '-85px',
            left: '0', // 👈 מיושר לקו שמאל של כפתורי הרמקול
            transform: 'translateX(200px)', // 👈 מזיז את החלונית שמאלה ויחסית הרבה (תוכל לשנות ל-80px- אם צריך עוד)
            backgroundColor: '#1e1e24',
            border: '1px solid #333',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 999,
            minWidth: '160px',
            padding: '6px 0',
            display: 'flex',
            flexDirection: 'column',
            direction: 'rtl'
          }}>
            <div style={{
              padding: '4px 10px',
              fontSize: '11px',
              color: '#666',
              borderBottom: '1px solid #2d2d35',
              marginBottom: '4px',
              fontWeight: 'bold'
            }}>
              בחירת פלייליסט:
            </div>
            {tracks.map((track) => {
              const isCurrent = track.url === currentTrackUrl;
              return (
                <button
                  key={track.id}
                  onClick={() => {
                    onSelectTrack(track.url);
                    setShowMenu(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isCurrent ? '#4caf50' : '#ddd',
                    padding: '8px 12px',
                    textAlign: 'right',
                    cursor: 'pointer',
                    fontSize: '13px',
                    width: '100%',
                    backgroundColor: isCurrent ? '#253528' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if(!isCurrent) e.target.style.backgroundColor = '#2d2d35';
                  }}
                  onMouseLeave={(e) => {
                    if(!isCurrent) e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {track.name} {isCurrent && ' ✓'}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveClock;