import React, { useState, useEffect } from 'react';

// ⚙️ הגדרות גלגל
const COOLDOWN_MS = 60 * 60 * 1000; // זמן נעילה (שעה אחת)
const PRIZES = [0, -40, 50, 10, -70, 100]; 

// פלטת צבעים יוקרתית (Golds, Deep Emerald, Royal Blue, Ruby Red, Purple)
const LUXURY_COLORS = [
  '#c0392b', // רובי אדום
  '#1e824c', // ברקת ירוק
  '#d4ac0d', // זהב מט
  '#2980b9', // ספיר כחול
  '#8e44ad', // אמתיסט סגול
  '#27ae60'  // ירוק זוהר
];

function LuckyWheel({ currentUser, updateUserPoints }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [deg, setDeg] = useState(0); 
  const [timeLeft, setTimeLeft] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  // מנגנון בדיקת טיימר החסימה
  useEffect(() => {
    if (!currentUser || !currentUser.name) return;

    const checkCooldown = () => {
      const lastSpin = localStorage.getItem(`last_spin_${currentUser.name}`);
      if (lastSpin) {
        const timePassed = Date.now() - parseInt(lastSpin, 10);
        if (timePassed < COOLDOWN_MS) {
          setIsLocked(true);
          const remaining = COOLDOWN_MS - timePassed;
          
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          return;
        }
      }
      setIsLocked(false);
      setTimeLeft('');
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const spinWheel = () => {
    if (isSpinning || isLocked) return;

    setIsSpinning(true);

    const prizeIndex = Math.floor(Math.random() * PRIZES.length);
    const selectedPrize = PRIZES[prizeIndex];

    const degreesPerSlice = 360 / PRIZES.length; 
    const targetSliceCenter = (prizeIndex * degreesPerSlice) + (degreesPerSlice / 2);

    const currentBaseRotation = deg % 360; 
    let degreesToMove = targetSliceCenter - currentBaseRotation;
    if (degreesToMove <= 0) {
      degreesToMove += 360;
    }

    const totalNewRotation = deg + degreesToMove + (6 * 360); // 6 סיבובים מלאים
    setDeg(totalNewRotation);

    setTimeout(() => {
      setIsSpinning(false);
      
      if (updateUserPoints) {
        updateUserPoints(selectedPrize);
      }

      if (currentUser?.name) {
        localStorage.setItem(`last_spin_${currentUser.name}`, Date.now().toString());
      }
      setIsLocked(true);
    }, 4000); // 4 שניות של סיבוב חלק
  };

  const degreesPerSlice = 360 / PRIZES.length;
  const gradientParts = LUXURY_COLORS.slice(0, PRIZES.length).map((color, index) => {
    const start = index * degreesPerSlice;
    const end = (index + 1) * degreesPerSlice;
    return `${color} ${start}deg ${end}deg`;
  });
  const conicGradientStyle = `conic-gradient(${gradientParts.join(', ')})`;

  // יצירת נקודות/נורות LED סביב ההיקף המוזהב
  const ledLights = Array.from({ length: 12 });

  return (
    <div className="dash-card-content" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: '20px', 
      padding: '25px',
      background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1b 100%)',
      borderRadius: '20px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(212, 172, 13, 0.2)',
      border: '1px solid rgba(212, 172, 13, 0.3)',
      maxWidth: '320px',
      margin: '0 auto'
    }}>
      
      {/* כותרת יוקרתית */}
      <h3 style={{ 
        color: '#f39c12', 
        fontSize: '1.2rem', 
        margin: 0, 
        textTransform: 'uppercase', 
        letterSpacing: '2px',
        textShadow: '0 0 10px rgba(243, 156, 18, 0.5)'
      }}>
         גלגל המזל
      </h3>

      {/* מיכל הגלגל והמסגרת */}
      <div style={{ position: 'relative', width: '220px', height: '220px', padding: '12px' }}>
        
        {/* מסגרת זהב חיצונית עם נורות LED */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)',
          boxShadow: '0 0 20px rgba(212, 172, 13, 0.6), inset 0 0 10px rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1
        }}>
          {/* נורות היקפיות */}
          {ledLights.map((_, i) => {
            const angle = (i * 360) / ledLights.length;
            return (
              <div key={i} style={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i % 2 === 0 ? '#fff' : '#ffd700',
                boxShadow: '0 0 6px #fff, 0 0 10px #ffd700',
                transform: `rotate(${angle}deg) translateY(-102px)`
              }} />
            );
          })}
        </div>

        {/* החץ המוזהב העליון (Pointer) */}
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: 'calc(50% - 14px)',
          width: '28px',
          height: '32px',
          zIndex: '10',
          filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.8))'
        }}>
          <svg viewBox="0 0 24 24" width="28" height="32">
            <path d="M12 2L22 20H2L12 2Z" fill="url(#goldGradient)" transform="rotate(180 12 11)" />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe259" />
                <stop offset="100%" stopColor="#ffa751" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* אלמנט הגלגל המסתובב */}
        <div 
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '3px solid #111',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.7)',
            position: 'relative',
            backgroundImage: conicGradientStyle,
            transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)' : 'transform 0.1s ease',
            transform: `rotate(-${deg}deg)`,
            zIndex: 2,
            overflow: 'hidden'
          }}
        >
          {/* קווים מפרידים */}
          {PRIZES.map((_, index) => (
            <div 
              key={`line-${index}`}
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: '2px',
                height: '50%',
                backgroundColor: 'rgba(255,255,255,0.3)',
                transformOrigin: 'bottom center',
                transform: `translateX(-50%) rotate(${index * degreesPerSlice}deg)`
              }}
            />
          ))}

          {/* טקסט הפרסים */}
          {PRIZES.map((prize, index) => {
            const sliceAngle = (index * degreesPerSlice) + (degreesPerSlice / 2);
            return (
              <div 
                key={index}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) rotate(${sliceAngle}deg) translateY(-68px) rotate(-${sliceAngle}deg)`,
                  color: '#fff',
                  fontWeight: '800',
                  fontSize: '15px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
                  pointerEvents: 'none',
                  fontFamily: 'system-ui, sans-serif'
                }}
              >
                {prize > 0 ? `+${prize}` : prize}
              </div>
            );
          })}
        </div>

        {/* כתר מרכזי מוזהב */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ffe259 0%, #ffa751 100%)',
          boxShadow: '0 0 10px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.8)',
          border: '2px solid #fff',
          zIndex: '5',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '14px'
        }}>
          
        </div>
      </div>

      {/* כפתור הפעלה או שעון נעילה */}
      {isLocked ? (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <button 
            disabled 
            style={{ 
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#2c3e50',
              color: '#7f8c8d',
              fontWeight: 'bold',
              cursor: 'not-allowed'
            }}
          >
            🔒 נעול
          </button>
          <p style={{ fontSize: '11px', color: '#e74c3c', marginTop: '8px', margin: '8px 0 0 0' }}>
            סיבוב הבא בעוד: <strong style={{ direction: 'ltr', display: 'inline-block', color: '#f39c12' }}>{timeLeft}</strong>
          </p>
        </div>
      ) : (
        <button 
          onClick={spinWheel} 
          disabled={isSpinning}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: isSpinning 
              ? '#555' 
              : 'linear-gradient(135deg, #f1c40f 0%, #e67e22 100%)',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: isSpinning ? 'wait' : 'pointer',
            boxShadow: isSpinning ? 'none' : '0 6px 20px rgba(241, 196, 15, 0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            letterSpacing: '1px'
          }}
          onMouseDown={(e) => !isSpinning && (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => !isSpinning && (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isSpinning ? '🎲 מסובב...' : '✨ סובב עכשיו!'}
        </button>
      )}
    </div>
  );
}

export default LuckyWheel;