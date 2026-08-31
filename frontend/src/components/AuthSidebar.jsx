import React, { useState } from 'react';
import Swal from 'sweetalert2'; // 🌟 ייבוא SweetAlert2

function AuthSidebar({ currentUser, activeAvatar, handleLoginSuccess, handleLogout }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  const openAuthBox = (registerMode) => {
    setIsLoggingIn(true);
    setIsRegistering(registerMode);
    setUsernameInput('');
    setPasswordInput('');
    setConfirmPasswordInput('');
  };

  const closeAuthBox = () => {
    setIsLoggingIn(false);
    setIsRegistering(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameInput.trim() === '') {
      Swal.fire({
        title: 'שגיאה',
        text: 'נא להזין שם משתמש',
        icon: 'warning',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    // === מצב הרשמה ===
    if (isRegistering) {
      if (passwordInput !== confirmPasswordInput) {
        Swal.fire({
          title: 'שגיאה',
          text: 'הסיסמאות אינן תואמות!',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#ff4444'
        });
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usernameInput, password: passwordInput }),
        });

        const data = await response.text();

        if (response.ok) {
          Swal.fire({
            title: 'נרשמת בהצלחה! 🎉',
            text: 'המשתמש נוצר בהצלחה בבסיס הנתונים. כעת ניתן להתחבר.',
            icon: 'success',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#28a745'
          });
          setIsRegistering(false);
          setConfirmPasswordInput('');
        } else {
          Swal.fire({
            title: 'שגיאה בהרשמה',
            text: data,
            icon: 'error',
            background: '#1a1a1a',
            color: '#fff',
            confirmButtonColor: '#ff4444'
          });
        }
      } catch (error) {
        console.error('Error during registration:', error);
        Swal.fire({
          title: 'שגיאת תקשורת',
          text: 'לא ניתן לגשת לשרת ה-Backend.',
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#ff4444'
        });
      }
      return;
    }

    // === מצב התחברות ===
    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      if (response.ok) {
        const userFromDb = await response.json();
        
        handleLoginSuccess({
          name: userFromDb.username,
          points: userFromDb.points
        });

        closeAuthBox();

        // 🌟 הודעת התחברות מוצלחת בסגנון Swal.fire
        Swal.fire({
          title: `ברוך הבא, ${userFromDb.username} `,
          text: 'התחברת בהצלחה למערכת',
          icon: 'success',
          confirmButtonText: 'המשך באפליקציה 🚀',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#28a745',
          customClass: {
            popup: 'swal2-dark-popup'
          }
        });

      } else {
        const errorMessage = await response.text();
        Swal.fire({
          title: 'שגיאת התחברות',
          text: errorMessage,
          icon: 'error',
          background: '#1a1a1a',
          color: '#fff',
          confirmButtonColor: '#ff4444'
        });
      }
    } catch (error) {
      console.error('Error during login:', error);
      Swal.fire({
        title: 'שגיאת תקשורת',
        text: 'לא ניתן לגשת לשרת ה-Backend.',
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#ff4444'
      });
    }
  };

  return (
    <div className="right-auth-sidebar">
      {currentUser ? (
        <div className="user-logged-in-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          
          {/* עיגול האוואטר */}
          <div className="avatar-circle-display" style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            backgroundColor: '#2b2a2a',
            border: '2px solid #007bff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            marginBottom: '5px',
            boxShadow: '0 0 10px rgba(0, 123, 255, 0.3)',
            filter: currentUser.activeBadge ? 'drop-shadow(0px 0px 4px rgba(0, 123, 255, 0.5))' : 'none'
          }}
          title={currentUser.activeBadge ? "אייקון פעיל מהחנות" : "אוואטר משתמש"}
          >
            {currentUser.activeBadge ? currentUser.activeBadge : activeAvatar}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <span className="welcome-user-text" style={{ fontWeight: 'bold' }}>שלום, {currentUser.name}</span>
          </div>

          <span style={{ fontWeight: 'bold' }} className="user-points-text"> מאזן נקודות: {currentUser.points}</span>
          
          <button
            onClick={handleLogout}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "15px",
              padding: "12px 30px",
              transition: ".3s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "rotate(-3deg) scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "rotate(0deg) scale(1)";
            }}
          >
            🚪 Log Out
          </button>
        </div>
      ) : isLoggingIn ? (
        <div className={`guest-card login-form-expanded ${isRegistering ? 'register-mode' : ''}`}>
          <div className="auth-tabs-row" style={{ display: 'flex', marginBottom: '15px', borderBottom: '1px solid #444' }}>
            <button 
              type="button"
              onClick={() => setIsRegistering(false)}
              style={{ flex: 1, padding: '8px', background: 'none', border: 'none', color: !isRegistering ? '#007bff' : '#aaa', borderBottom: !isRegistering ? '2px solid #007bff' : 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              התחברות
            </button>
            <button 
              type="button"
              onClick={() => setIsRegistering(true)}
              style={{ flex: 1, padding: '8px', background: 'none', border: 'none', color: isRegistering ? '#007bff' : '#aaa', borderBottom: isRegistering ? '2px solid #007bff' : 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mini-login-form">
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
              {isRegistering ? 'יצירת משתמש חדש' : 'כניסה למערכת'}
            </h3>

            <div className="mini-form-group">
              <label>שם משתמש</label>
              <input 
                type="text" 
                placeholder="הכנס שם..." 
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="mini-input"
                required
              />
            </div>
            <div className="mini-form-group">
              <label>סיסמה</label>
              <input 
                type="password" 
                placeholder="הכנס סיסמה..." 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="mini-input"
                required
              />
            </div>

            {isRegistering && (
              <div className="mini-form-group">
                <label>אימות סיסמה</label>
                <input 
                  type="password" 
                  placeholder="הכנס סיסמה שנית..." 
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="mini-input"
                  required
                />
              </div>
            )}

            <div className="form-actions-row">
              <button type="submit" className="action-button mini-submit-btn">
                {isRegistering ? 'הרשמה' : 'התחבר'}
              </button>
              <button type="button" onClick={closeAuthBox} className="auth-action-link cancel-link">ביטול</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="guest-card" style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => openAuthBox(false)} className="action-button login-trigger-btn">
            התחבר
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthSidebar;