import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import LuckyWheel from './LuckyWheel';
// הייבוא מתוך תיקיית הדאטה 📂
import { ICON_SHOP_ITEMS } from '../data/Icons';

function Shop({ currentUser, updateUserPoints }) {
  const navigate = useNavigate();
  
  // סטייט מקומי לשמירת האייקון שנבחר כרגע בגריד
  const [selectedIcon, setSelectedIcon] = useState(null);
  
  const handleBackToHome = () => {
    navigate('/');
  };

  // 🔒 חסימת אורחים
  if (!currentUser || !currentUser.name) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <header className="hero-section" style={{ width: '100%', textAlign: 'center' }}>
          <h1 className="main-title" style={{ color: '#ffffff' }}>🎁 חנות פרסים ונקודות</h1>
          <p className="subtitle" style={{ color: '#ff4444' }}>🚫 הגישה חסומה לאורחים</p>
        </header>

        <div className="dash-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '35px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#fff', lineHeight: '1.5' }}>
            כדי להיכנס לחנות המותגים, לרכוש פרסים ולשדרג את החשבון שלך, עליך להתחבר למערכת תחילה.
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

  const points = currentUser.points !== undefined ? currentUser.points : 0;
  const ownedIcons = currentUser.ownedIcons || [];
  const activeBadge = currentUser.activeBadge;

  // 🛒 הפעלת פעולה (רכישה או החלפה)
  const handleExecuteAction = async () => {
    if (!selectedIcon) return;

    const isOwned = ownedIcons.includes(selectedIcon.id);

    if (isOwned) {
      if (typeof currentUser.onSelectActiveBadge === 'function') {
        currentUser.onSelectActiveBadge(selectedIcon.icon);
      } else if (typeof currentUser.onPurchaseIcon === 'function') {
        currentUser.onPurchaseIcon(selectedIcon.id, selectedIcon.icon);
      }

      Swal.fire({
        title: 'Icon Changed! 🔄',
        text: `Your active icon has been changed to ${selectedIcon.icon}.`,
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'Awesome!'
      });

      setSelectedIcon(null);
      return;
    }

    if (points < selectedIcon.price) {
      Swal.fire({
        title: 'Not Enough Points! 💰',
        text: `You need ${selectedIcon.price - points} more points to purchase the ${selectedIcon.icon} icon.`,
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#007bff',
        confirmButtonText: 'OK'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Purchase? 🤔',
      text: `Are you sure you want to buy the ${selectedIcon.icon} icon for ${selectedIcon.price} points?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Buy Now!',
      cancelButtonText: 'Cancel',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#007bff',
      cancelButtonColor: '#ff4444'
    });

    if (!result.isConfirmed) return;

    updateUserPoints(-selectedIcon.price);

    if (typeof currentUser.onPurchaseIcon === 'function') {
      currentUser.onPurchaseIcon(selectedIcon.id, selectedIcon.icon);
    }

    Swal.fire({
      title: 'Purchase Successful! 🎉',
      text: `You have successfully purchased and activated the ${selectedIcon.icon} icon!`,
      icon: 'success',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Great!'
    });

    setSelectedIcon(null);
  };

  // עיצוב כרטיסייה מותאם יוקרתי
  const compactCardStyle = {
    minHeight: '480px', 
    padding: '24px',    
    display: 'flex',
    flexDirection: 'column',
    justify: 'space-between',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: 'radial-gradient(circle, #1a1a2e 0%, #0f0f1b 100%)',
    borderRadius: '20px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), inset 0 0 15px rgba(212, 172, 13, 0.15)',
    border: '1px solid rgba(212, 172, 13, 0.25)'
  };

  return (
    <div className="page-container" style={{ paddingBottom: '40px' }}>
      <style>{`
        .custom-shop-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 172, 13, 0.3);
          border-radius: 10px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 172, 13, 0.6);
        }
        
        .icon-item-card {
          transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .icon-item-card:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 6px 15px rgba(212, 172, 13, 0.25);
        }

        .luxury-gold-text {
          background: linear-gradient(135deg, #fff6d1 0%, #ffd700 40%, #cca010 70%, #fff1b0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.35));
        }
      `}</style>

      {/* 👑 כותרת ראשית וכותרת משנה מרהיבה ויוקרתית */}
      <header className="hero-section" style={{ textAlign: 'center', marginBottom: '35px', paddingTop: '10px' }}>
        <h1 className="main-title luxury-gold-text" style={{ 
          fontSize: '2.8rem', 
          fontWeight: '900', 
          margin: '0 0 10px 0',
          letterSpacing: '1px'
        }}>
           חנות הפרסים והאייקונים
        </h1>

        {/* מפריד דקורטיבי */}
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
          סובב את גלגל המזל, אסוף נקודות ושדרג את הפרופיל שלך עם אייקונים בלעדיים!
        </p>
      </header>

      <div className="dashboard-grid" style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px', 
        maxWidth: '900px',
        margin: '0 auto 30px auto',
        alignItems: 'stretch'
      }}>
        
        {/* 🎨 כרטיסיית חנות אייקונים */}
        <div className="dash-card" style={compactCardStyle}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(212, 172, 13, 0.2)', paddingBottom: '10px' }}>
              <h3 style={{ 
                fontSize: '1.2rem', 
                color: '#f39c12',
                margin: 0,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                textShadow: '0 0 10px rgba(243, 156, 18, 0.4)'
              }}>
                💎 חנות אייקונים
              </h3>
            </div>
            
            <p style={{ color: '#b0b0c0', fontSize: '0.85rem', margin: '0 0 12px 0' }}>
              בחר אייקון שתרצה לרכוש או להפעיל בפרופיל האישי שלך:
            </p>
          </div>

          <div className="dash-card-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            
            <div className="icons-shop-grid custom-shop-scrollbar" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '10px',
              marginBottom: '15px',
              maxHeight: '290px', 
              overflowY: 'auto',
              padding: '6px'     
            }}>
              {ICON_SHOP_ITEMS.map((item) => {
                const isOwned = ownedIcons.includes(item.id);
                const isSelected = selectedIcon?.id === item.id;
                const isActive = activeBadge === item.icon;

                let borderStyle = '1px solid rgba(255, 255, 255, 0.08)';
                let glowStyle = 'none';
                let bgStyle = 'rgba(255, 255, 255, 0.03)';

                if (isSelected) {
                  borderStyle = '2px solid #007bff';
                  glowStyle = '0 0 12px rgba(0, 123, 255, 0.5)';
                  bgStyle = 'rgba(0, 123, 255, 0.18)';
                } else if (isActive) {
                  borderStyle = '2px solid #28a745';
                  glowStyle = '0 0 12px rgba(40, 167, 69, 0.4)';
                  bgStyle = 'rgba(40, 167, 69, 0.18)';
                }

                return (
                  <div 
                    key={item.id} 
                    className="icon-item-card"
                    onClick={() => setSelectedIcon(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: bgStyle,
                      padding: '8px 4px', 
                      borderRadius: '12px',
                      border: borderStyle,
                      boxShadow: glowStyle,
                      cursor: 'pointer',
                      opacity: isOwned && !isActive && !isSelected ? 0.75 : 1,
                      position: 'relative'
                    }}
                    title={item.name}
                  >
                    <span style={{ fontSize: '26px', marginBottom: '4px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                      {item.icon}
                    </span>
                    
                    <span style={{ 
                      fontSize: '9.5px', 
                      color: isActive ? '#28a745' : isOwned ? '#aaa' : '#ffd700', 
                      fontWeight: 'bold',
                      letterSpacing: '0.3px'
                    }}>
                      {isActive ? 'פעיל' : isOwned ? 'בבעלותך' : `${item.price} נ'`}
                    </span>
                    
                    {isOwned && !isActive && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '3px', 
                        right: '4px', 
                        fontSize: '8px', 
                        color: '#28a745', 
                        fontWeight: 'bold',
                        background: 'rgba(40, 167, 69, 0.15)',
                        borderRadius: '50%',
                        width: '13px',
                        height: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>✓</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* כפתור הפעולה הראשי */}
            <button
              onClick={handleExecuteAction}
              disabled={!selectedIcon || activeBadge === selectedIcon.icon}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: !selectedIcon || activeBadge === selectedIcon.icon 
                  ? '#2a2a38' 
                  : ownedIcons.includes(selectedIcon.id) 
                  ? 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)' 
                  : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                color: !selectedIcon || activeBadge === selectedIcon.icon ? '#666' : '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
                letterSpacing: '0.5px',
                cursor: !selectedIcon || activeBadge === selectedIcon.icon ? 'not-allowed' : 'pointer',
                boxShadow: !selectedIcon || activeBadge === selectedIcon.icon ? 'none' : '0 6px 18px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease',
                marginTop: 'auto'
              }}
            >
              {!selectedIcon 
                ? 'בחר אייקון מהרשימה' 
                : activeBadge === selectedIcon.icon 
                ? 'אייקון זה כבר פעיל'
                : ownedIcons.includes(selectedIcon.id) 
                ? `הפעל את האייקון ${selectedIcon.icon}` 
                : `רכוש את האייקון ${selectedIcon.icon}`}
            </button>
          </div>
        </div>

        {/* 🎡 כרטיסיית גלגל המזל */}
        <div className="dash-card" style={compactCardStyle}>
          <div style={{ borderBottom: '1px solid rgba(212, 172, 13, 0.2)', paddingBottom: '10px', marginBottom: '10px' }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              color: '#f39c12',
              margin: '0 0 4px 0',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textShadow: '0 0 10px rgba(243, 156, 18, 0.4)'
            }}>
              🎡 גלגל המזל
            </h3>
            <p style={{ color: '#b0b0c0', fontSize: '0.85rem', margin: 0 }}>
              סובב את הגלגל פעם ביום כדי לזכות בנקודות בונוס!
            </p>
          </div>

          <div style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            flex: 1,
            transform: 'scale(0.9)',
            transformOrigin: 'center center'
          }}>
            <LuckyWheel 
              currentUser={currentUser} 
              updateUserPoints={updateUserPoints} 
            />
          </div>
        </div>

      </div>
      
      <div style={{ textAlign: 'center' }}>
        <button onClick={handleBackToHome} className="action-button back-btn" style={{ minWidth: '180px' }}>
          חזרה למסך הבית
        </button>
      </div>
    </div>
  );
}

export default Shop;