import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { FaWhatsapp, FaPaperPlane, FaUserCircle, FaUserPlus, FaSignOutAlt, FaPhoneAlt, FaUser, FaRedo } from 'react-icons/fa';

const socket = io('http://localhost:5000');

// פונקציית עזר לנרמול מספרי טלפון (ממירה 05X ל-972X ומנקה תווים)
const normalizePhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('05')) {
    clean = '972' + clean.slice(1);
  }
  return clean;
};

function WhatsAppIntegration({ currentUser, onBackToHome }) {
  const navigate = useNavigate();

  const [qrCode, setQrCode] = useState('');

  // 1. טעינת סטטוס התחברות מ-localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('wa_is_logged_in') === 'true';
  });

  // 2. טעינת אנשי הקשר מ-localStorage (שומר על היוזרים במעבר כרטיסיות)
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('wa_contacts');
    return saved ? JSON.parse(saved) : [];
  });

  // 3. טעינת ההודעות מ-localStorage (שומר על היסטוריית השיחות)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('wa_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeContact, setActiveContact] = useState(null);
  const [unreadPhones, setUnreadPhones] = useState([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  // 💾 שמירה אוטומטית של אנשי הקשר ל-localStorage בכל שינוי
  useEffect(() => {
    localStorage.setItem('wa_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // 💾 שמירה אוטומטית של ההודעות ל-localStorage בכל שינוי
  useEffect(() => {
    localStorage.setItem('wa_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    socket.on('qr', (qr) => {
      setQrCode(qr);
      setIsLoggedIn(false);
      localStorage.setItem('wa_is_logged_in', 'false');
    });

    socket.on('ready', () => {
      setIsLoggedIn(true);
      localStorage.setItem('wa_is_logged_in', 'true');
      setQrCode('');
    });

    // קבלת הודעות נכנסות בזמן אמת
    const handleIncomingMessage = ({ fromPhone, senderName, text, time }) => {
      console.log('📩 הודעה נכנסת ב-React:', { fromPhone, text });

      const cleanIncomingPhone = normalizePhone(fromPhone);
      if (!cleanIncomingPhone) return;

      // א) אם איש הקשר לא קיים, מוסיפים אותו אוטומטית
      setContacts(prevContacts => {
        const exists = prevContacts.some(c => normalizePhone(c.phone) === cleanIncomingPhone);
        if (!exists) {
          const newContact = {
            id: cleanIncomingPhone,
            name: senderName || cleanIncomingPhone,
            phone: cleanIncomingPhone
          };
          return [newContact, ...prevContacts];
        }
        return prevContacts;
      });

      // ב) שמירת ההודעה הנכנסת
      const formattedTime = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setMessages(prevMsgs => ({
        ...prevMsgs,
        [cleanIncomingPhone]: [
          ...(prevMsgs[cleanIncomingPhone] || []),
          { id: Date.now() + Math.random(), sender: 'them', text, time: formattedTime }
        ]
      }));

      // ג) חיווי הודעה שלא נקראה
      setUnreadPhones(prevUnread => {
        // בודק מול איש הקשר הפעיל הנוכחי
        if (!activeContact || normalizePhone(activeContact.phone) !== cleanIncomingPhone) {
          if (!prevUnread.includes(cleanIncomingPhone)) {
            return [...prevUnread, cleanIncomingPhone];
          }
        }
        return prevUnread;
      });
    };

    socket.on('message_received', handleIncomingMessage);

    return () => {
      socket.off('qr');
      socket.off('ready');
      socket.off('message_received', handleIncomingMessage);
    };
  }, [activeContact]);

  const handleSelectContact = (contact) => {
    setActiveContact(contact);
    const cleanPhone = normalizePhone(contact.phone);
    setUnreadPhones(prev => prev.filter(p => p !== cleanPhone));
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const normalizedPhone = normalizePhone(newContactPhone.trim());
    const existingContact = contacts.find(c => normalizePhone(c.phone) === normalizedPhone);

    if (existingContact) {
      handleSelectContact(existingContact);
    } else {
      const newContact = { 
        id: normalizedPhone, 
        name: newContactName.trim(), 
        phone: normalizedPhone 
      };
      setContacts(prev => [newContact, ...prev]);
      handleSelectContact(newContact);
    }

    setNewContactName('');
    setNewContactPhone('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeContact) return;

    const targetPhone = normalizePhone(activeContact.phone);
    const text = inputMessage;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    socket.emit('send_message', {
      toPhone: targetPhone,
      text: text
    });

    setMessages(prev => ({
      ...prev,
      [targetPhone]: [
        ...(prev[targetPhone] || []),
        { id: Date.now(), sender: 'me', text, time }
      ]
    }));

    setInputMessage('');
  };

  const handleGoHome = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/');
    }
  };

  const handleWhatsAppLogout = () => {
    socket.emit('logout');
    setIsLoggedIn(false);
    localStorage.removeItem('wa_is_logged_in');
    localStorage.removeItem('wa_contacts');
    localStorage.removeItem('wa_messages');
    setQrCode('');
    setActiveContact(null);
    setContacts([]);
    setMessages({});
  };

  if (!currentUser) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px', direction: 'rtl' }}>
        <header className="hero-section" style={{ width: '100%', textAlign: 'center' }}>
          <h1 className="main-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <FaWhatsapp style={{ color: '#25D366' }} /> חיבור ל-WhatsApp
          </h1>
          <p className="subtitle" style={{ color: '#ff4444', fontWeight: 'bold', marginTop: '10px' }}>
            🚫 הגישה חסומה לאורחים
          </p>
        </header>

        <div className="dash-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '35px', marginTop: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#fff', lineHeight: '1.5' }}>
            כדי להשתמש במערכת ה-WhatsApp ולשלוח הודעות בזמן אמת, עליך להתחבר למערכת תחילה.
          </h3>
        </div>

        <button onClick={handleGoHome} className="action-button back-btn" style={{ marginTop: '25px', width: '200px' }}>
          חזרה למסך הבית
        </button>
      </div>
    );
  }

  const activePhone = activeContact ? normalizePhone(activeContact.phone) : null;

  return (
    <div className="page-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', direction: 'rtl' }}>
      
      <header className="hero-section" style={{ width: '100%', textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="main-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: 0, fontSize: '1.8rem', color: '#fff' }}>
          <FaWhatsapp style={{ color: '#25D366', fontSize: '1.2em' }} /> חיבור ל-WhatsApp בזמן אמת
        </h1>
      </header>

      {!isLoggedIn ? (
        <div className="dash-card" style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '40px 30px',
          maxWidth: '450px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <FaWhatsapp style={{ fontSize: '3rem', color: '#25D366', marginBottom: '10px' }} />
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>סרוק להתחברות</h2>
          <p style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '20px' }}>
            פתח את ה-WhatsApp בטלפון, היכנס ל-**מכשירים מקושרים**, וסרוק את קוד ה-QR:
          </p>

          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px' }}>
            {qrCode ? (
              <QRCodeSVG value={qrCode} size={220} />
            ) : (
              <div style={{ color: '#333', padding: '30px 10px', fontSize: '0.9rem' }}>
                מייצר קוד QR... אנא המתן.
              </div>
            )}
          </div>

          <button
            onClick={handleWhatsAppLogout}
            style={{
              backgroundColor: 'transparent',
              color: '#ef4444',
              border: '1px solid #ef4444',
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaRedo /> איפוס חיבור / התנתקות
          </button>
        </div>
      ) : (

        <div className="dash-card" style={{
          backgroundColor: '#1e1e1e',
          border: '1px solid #333',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}>
          <div style={{
            padding: '12px 20px',
            backgroundColor: '#111b21',
            borderBottom: '1px solid #222d34',
            display: 'flex',
            alignItems: 'center'
          }}>
            <span style={{ color: '#25D366', fontSize: '0.95rem', fontWeight: 'bold' }}>
              ● מחובר לחשבון ה-WhatsApp שלך
            </span>

            <button
              onClick={handleWhatsAppLogout}
              style={{
                marginRight: 'auto',
                backgroundColor: 'transparent',
                color: '#ef4444',
                border: '1px solid #ef4444',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaSignOutAlt /> התנתק
            </button>
          </div>

          <div style={{ display: 'flex', height: '580px' }}>
            {/* סרגל אנשי קשר */}
            <div style={{ width: '38%', borderLeft: '1px solid #222d34', backgroundColor: '#111b21', display: 'flex', flexDirection: 'column' }}>
              <form onSubmit={handleAddContact} style={{ padding: '14px', backgroundColor: '#202c33', borderBottom: '1px solid #222d34' }}>
                <div style={{ color: '#e9edef', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaUserPlus style={{ color: '#25D366' }} /> הוספת איש קשר חדש
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="שם איש הקשר"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#2a3942', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
                    />
                    <FaUser style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8696a0', fontSize: '0.8rem' }} />
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      placeholder="מספר טלפון (לדוגמה: 0501234567)"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      style={{ width: '100%', padding: '8px 30px 8px 10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#2a3942', color: '#fff', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }}
                    />
                    <FaPhoneAlt style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8696a0', fontSize: '0.8rem' }} />
                  </div>

                  <button
                    type="submit"
                    disabled={!newContactName.trim() || !newContactPhone.trim()}
                    style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    התחל שיחה
                  </button>
                </div>
              </form>

              <div style={{ padding: '10px 14px', color: '#8696a0', fontSize: '0.75rem', fontWeight: 'bold' }}>שיחות פתוחות</div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {contacts.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.85rem' }}>
                    אין שיחות שמורות. הוסף איש קשר למעלה!
                  </div>
                ) : (
                  contacts.map(contact => {
                    const cPhone = normalizePhone(contact.phone);
                    const hasUnread = unreadPhones.includes(cPhone);
                    const isSelected = activePhone === cPhone;

                    return (
                      <div
                        key={contact.id || cPhone}
                        onClick={() => handleSelectContact(contact)}
                        style={{ 
                          padding: '12px 16px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px', 
                          cursor: 'pointer', 
                          backgroundColor: isSelected ? '#2a3942' : 'transparent', 
                          borderBottom: '1px solid #1f2c34' 
                        }}
                      >
                        <FaUserCircle style={{ fontSize: '2.2rem', color: '#8696a0' }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ color: '#e9edef', fontWeight: '500', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{contact.name}</span>
                            {hasUnread && (
                              <span style={{ width: '10px', height: '10px', backgroundColor: '#ff4444', borderRadius: '50%', display: 'inline-block' }} />
                            )}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#8696a0' }}>{contact.phone}</div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* חלון הודעות */}
            <div style={{ width: '62%', display: 'flex', flexDirection: 'column', backgroundColor: '#0b141a' }}>
              {activeContact ? (
                <>
                  <div style={{ padding: '10px 16px', backgroundColor: '#202c33', display: 'flex', alignItems: 'center', gap: '12px', color: '#e9edef' }}>
                    <FaUserCircle style={{ fontSize: '2rem', color: '#8696a0' }} />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{activeContact.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#8696a0' }}>{activeContact.phone}</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(messages[activePhone] || []).map(msg => (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                          backgroundColor: msg.sender === 'me' ? '#005c4b' : '#202c33',
                          color: '#e9edef',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          maxWidth: '70%',
                          wordBreak: 'break-word'
                        }}
                      >
                        <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
                        <div style={{ fontSize: '0.65rem', color: '#8696a0', textAlign: 'left', marginTop: '4px' }}>{msg.time}</div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ padding: '12px', backgroundColor: '#202c33', display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="הקלד הודעה..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#2a3942', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                    />
                    <button type="submit" disabled={!inputMessage.trim()} style={{ backgroundColor: '#00a884', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 18px', cursor: 'pointer' }}>
                      <FaPaperPlane style={{ transform: 'scaleX(-1)' }} />
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8696a0' }}>
                  בחר איש קשר כדי להתחיל בצ'אט
                </div>
              )}
            </div>
          </div>
        </div>
        
      )}

      <button onClick={handleGoHome} className="action-button back-btn" style={{ marginTop: '25px', width: '200px' }}>
        חזרה למסך הבית
      </button>

    </div>
  );
}

export default WhatsAppIntegration;