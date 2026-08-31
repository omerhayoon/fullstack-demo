import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PiMathOperationsFill } from "react-icons/pi";
import { AiFillLock } from "react-icons/ai"; 
import { mathTopics } from '../data/mathTopics'; 

function Security({ currentUser }) {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/');
  };

  const userPoints = currentUser?.points || 0;

  return (
    <div className="security-apple-wrapper">
      {/* סגנונות CSS מובנים בקובץ למראה יוקרתי ומודרני */}
      <style>{`
        .security-apple-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
          direction: rtl;
          min-height: 100vh;
          background: #0f0f11;
          color: #f5f5f7;
          padding: 40px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .apple-glass-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .security-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .security-header h1 {
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
          background: linear-gradient(180deg, #ffffff 0%, #a1a1a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }

        .security-header p {
          font-size: 0.95rem;
          color: #86868b;
          margin: 0;
          font-weight: 400;
        }

        .points-badge-container {
          margin-top: 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.9rem;
          color: #a1a1a6;
        }

        .points-highlight {
          color: #30d158;
          font-weight: 700;
          font-size: 1.1rem;
        }

        /* Topics Grid */
        .topics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
          width: 100%;
          max-width: 960px;
          margin-top: 20px;
          box-sizing: border-box;
        }

        .topic-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          min-height: 220px;
          box-sizing: border-box;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .topic-card.unlocked:hover {
          transform: translateY(-4px);
          border-color: rgba(10, 132, 255, 0.4);
          box-shadow: 0 12px 30px rgba(10, 132, 255, 0.15);
        }

        .topic-card.locked {
          opacity: 0.55;
          background: rgba(255, 255, 255, 0.02);
          border-style: dashed;
        }

        .topic-status-header {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 12px;
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .status-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
        }

        .status-tag.locked-tag {
          background: rgba(255, 69, 58, 0.12);
          color: #ff453a;
          border: 1px solid rgba(255, 69, 58, 0.25);
        }

        .status-tag.unlocked-tag {
          background: rgba(10, 132, 255, 0.12);
          color: #0a84ff;
          border: 1px solid rgba(10, 132, 255, 0.25);
        }

        .topic-title {
          font-size: 1.15rem;
          font-weight: 600;
          color: #f5f5f7;
          margin: 10px 0;
          line-height: 1.35;
        }

        .topic-footer {
          width: 100%;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .points-required-text {
          font-size: 0.8rem;
          color: #86868b;
          font-weight: 500;
        }

        /* Apple Primary Button */
        .apple-btn-action {
          width: 100%;
          background: #0a84ff;
          color: #ffffff;
          border: none;
          border-radius: 14px;
          padding: 10px 16px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(10, 132, 255, 0.25);
        }

        .apple-btn-action:hover:not(:disabled) {
          background: #0071e3;
          box-shadow: 0 6px 16px rgba(10, 132, 255, 0.35);
        }

        .apple-btn-action:disabled {
          background: rgba(255, 255, 255, 0.08);
          color: #6e6e73;
          box-shadow: none;
          cursor: not-allowed;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .apple-btn-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #f5f5f7;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 10px 24px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 36px;
        }

        .apple-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.14);
        }
      `}</style>

      {/* header */}
      <header className="security-header">
        <h1>
          <PiMathOperationsFill style={{ color: '#0a84ff' }} /> תרגול מתמטיקה
        </h1>
        <p>צבור נקודות כדי לפתוח נושאי תרגול מתקדמים</p>

        {currentUser && (
          <div className="points-badge-container">
            <span>הניקוד הנוכחי שלך:</span>
            <span className="points-highlight">{userPoints}</span>
          </div>
        )}
      </header>

      {/* הגנה - במידה והמשתמש אינו מחובר */}
      {!currentUser ? (
        <div className="apple-glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: 600, color: '#ff453a' }}>
            🚫 הגישה חסומה לאורחים
          </h3>
          <p style={{ color: '#a1a1a6', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 16px 0' }}>
            כדי לגשת לשלבי התרגול, לצבור נקודות ולפתוח נושאים מתקדמים, עליך להתחבר למערכת תחילה.
          </p>
          <p style={{ color: '#86868b', fontSize: '0.8rem', margin: 0 }}>
            אנא השתמש בחלונית ההתחברות שבמסך הבית.
          </p>
        </div>
      ) : (
        /* גריד כרטיסיות הלימוד למשתמש מחובר */
        <div className="topics-grid">
          {mathTopics.map((topic) => {
            const isLocked = userPoints < topic.pointsRequired;

            return (
              <div 
                key={topic.id} 
                className={`apple-glass-card topic-card ${isLocked ? 'locked' : 'unlocked'}`}
              >
                <div className="topic-status-header">
                  {isLocked ? (
                    <span className="status-tag locked-tag">
                      <AiFillLock /> נעול
                    </span>
                  ) : (
                    <span className="status-tag unlocked-tag">
                      שלב {topic.id}
                    </span>
                  )}
                </div>

                <h3 className="topic-title">{topic.title}</h3>
                
                <div className="topic-footer">
                  {isLocked && (
                    <div className="points-required-text">
                      נדרשות {topic.pointsRequired} נקודות לפתיחה
                    </div>
                  )}

                  <button 
                    className="apple-btn-action" 
                    disabled={isLocked} 
                    onClick={() => navigate(`/math-topic/${topic.id}`)}
                  >
                    {isLocked ? 'חסום' : 'התחל תרגול'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* כפתור חזרה למסך הבית */}
      <button onClick={handleBackToHome} className="apple-btn-secondary">
        חזרה למסך הבית
      </button>
    </div>
  );
}

export default Security;