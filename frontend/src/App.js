import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Messages from './components/Messages';
import Security from './components/Security';
import Shop from './components/Shop'; 
import MathTopicScreen from './components/MathTopicScreen'; 
import LiveClock from './components/LiveClock';
import Quizzes from './components/Quizzes';
import AuthSidebar from './components/AuthSidebar'; 
import WhatsAppIntegration from './components/WhatsAppIntegration';
import GameManager from './components/GameManager';
import PuzzleGame from './components/games/PuzzleGame';
import MemoryGame from './components/games/MemoryGame';
import TetrisGame from './components/games/TetrisGame';
import ConnectFourGame from './components/games/ConnectFourGame';
import './App.css';

const AVAILABLE_TRACKS = [
  { id: 'lofi', name: '☕ Lo-Fi עבודה וריכוז', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'focus', name: '🎧 תדרי מיקוד עמוק', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'guitar', name: '🎸 גיטרה אקוסטית רכה', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: 'piano', name: '🎹 פסנתר אקוסטי מרגיע', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'uplifting', name: '⚡ סינת\'-צ\'יל עירני', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' }
];

function App() {
  // --- סטייט ולוגיקה למוזיקת רקע דינמית ---
  const [songUrl, setSongUrl] = useState(AVAILABLE_TRACKS[0].url);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => new Audio(songUrl));

  useEffect(() => {
    const wasPlaying = isPlaying;
    if (wasPlaying) audio.pause();
    
    audio.src = songUrl;
    audio.load();
    
    if (wasPlaying) {
      audio.play().catch(err => console.log("הניגון נחסם זמנית על ידי הדפדפן", err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songUrl, audio]);

  const toggleMusic = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => console.log("שגיאה בהפעלת האודיו:", err));
    }
    setIsPlaying(!isPlaying);
  };

  // --- הסטייט הקיים של האפליקציה ---
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('app_messages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [activeAvatar, setActiveAvatar] = useState('👤');

  useEffect(() => {
    if (!currentUser || !currentUser.name) return;

    const currentUsername = currentUser.name;
    const avatarKey = `user_avatar_${currentUsername}`;
    const savedAvatar = localStorage.getItem(avatarKey);
    if (savedAvatar) {
      setActiveAvatar(savedAvatar);
    }

    const ownedIconsKey = `user_owned_icons_${currentUsername}`;
    const activeBadgeKey = `user_active_badge_${currentUsername}`;
    const activeBadgeIdKey = `user_active_badge_id_${currentUsername}`;

    const savedOwnedIcons = localStorage.getItem(ownedIconsKey);
    const savedActiveBadge = localStorage.getItem(activeBadgeKey);
    const savedActiveBadgeId = localStorage.getItem(activeBadgeIdKey);

    setCurrentUser(prev => {
      if (!prev || prev.ownedIcons) return prev; 
      
      return {
        ...prev,
        ownedIcons: savedOwnedIcons ? JSON.parse(savedOwnedIcons) : [],
        activeBadge: savedActiveBadge || '',
        activeBadgeId: savedActiveBadgeId || ''
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.name]);

  const handlePurchaseIcon = (iconId, iconSymbol) => {
    if (!currentUser) return;

    setCurrentUser(prev => {
      if (!prev) return prev;

      const currentOwned = prev.ownedIcons || [];
      const updatedOwned = currentOwned.includes(iconId) 
        ? currentOwned 
        : [...currentOwned, iconId];

      localStorage.setItem(`user_owned_icons_${prev.name}`, JSON.stringify(updatedOwned));
      localStorage.setItem(`user_active_badge_${prev.name}`, iconSymbol);
      localStorage.setItem(`user_active_badge_id_${prev.name}`, iconId);

      return {
        ...prev,
        ownedIcons: updatedOwned,
        activeBadge: iconSymbol,
        activeBadgeId: iconId
      };
    });
  };

  const handleSelectIcon = (iconId, iconSymbol) => {
    if (!currentUser) return;

    setCurrentUser(prev => {
      if (!prev || !prev.ownedIcons.includes(iconId)) return prev;

      localStorage.setItem(`user_active_badge_${prev.name}`, iconSymbol);
      localStorage.setItem(`user_active_badge_id_${prev.name}`, iconId);

      return {
        ...prev,
        activeBadge: iconSymbol,
        activeBadgeId: iconId
      };
    });
  };

  const updateUserPoints = async (pointsToAdd) => {
    if (!currentUser) return; 

    setCurrentUser(prev => {
      const updatedPoints = Math.max(0, (prev.points || 0) + pointsToAdd);

      fetch('http://localhost:8080/api/users/update-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: prev.name, 
          points: updatedPoints 
        }),
      })
      .then(response => {
        if (!response.ok) {
          console.error('השרת נכשל בעדכון הנקודות בבסיס הנתונים');
        } else {
          console.log(`✅ הנקודות עודכנו בשרת ל-${updatedPoints}`);
        }
      })
      .catch(error => {
        console.error('שגיאת תקשורת בעדכון נקודות מול השרת:', error);
      });

      return {
        ...prev,
        points: updatedPoints
      };
    });
  };

  // שמירת היסטוריית מבחנים פר-משתמש ב-localStorage
  const handleSaveQuizResult = (quizResult) => {
    if (!currentUser) return;

    const username = currentUser.name || currentUser.username || 'guest';
    const historyKey = `quiz_history_${username}`;
    
    const existingHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    const updatedHistory = [quizResult, ...existingHistory];
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  };

  const handleFakeLogout = () => {
    setCurrentUser(null);
  };

  useEffect(() => {
    localStorage.setItem('app_messages', JSON.stringify(messages));
  }, [messages]);

  // 🎙️ הוספת הפרמטר audioUrl לקבלת הקלטות קוליות
  const addMessage = (sender, text, imageUrl = null, audioUrl = null) => {
    const now = new Date();
    const newMessage = {
      id: Date.now(),
      sender: sender,
      text: text,
      image: imageUrl,
      audio: audioUrl, // 👈 שמירת האודיו בפורמט Base64
      date: now.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false })
    };
    setMessages((prevMessages) => [newMessage, ...prevMessages]);
  };

  const deleteMessage = (id) => {
    setMessages((prevMessages) => prevMessages.filter(msg => msg.id !== id));
  };

  const userWithShopMethods = currentUser ? {
    ...currentUser,
    onPurchaseIcon: handlePurchaseIcon,
    onSelectIcon: handleSelectIcon
  } : null;

  return (
    <div className="app-container">
      <div className="bg-glow"></div>

      {/* סרגל צידי שמאלי */}
      <div className="left-sidebar">
        <LiveClock 
          isPlaying={isPlaying} 
          toggleMusic={toggleMusic} 
          tracks={AVAILABLE_TRACKS}
          currentTrackUrl={songUrl}
          onSelectTrack={setSongUrl}
        />

        {/* 🟢 התנאה: הצגת הפיד רק אם יש משתמש מחובר */}
        {currentUser ? (
          <div 
            className="messages-feed-widget" 
            style={{ 
              height: '750px',
              minHeight: '750px',
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            <div className="widget-header">
              <h4>💬 עדכוני מערכת אחרונים</h4>
            </div>

            <div className="widget-content" style={{ flexGrow: 1, overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <p className="no-messages">אין הודעות כרגע...</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="feed-message-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="message-meta">
                      <span className="message-sender">{msg.sender}</span>
                      <div className="meta-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="message-time-stamp">{msg.date} | {msg.time}</span>
                      </div>
                    </div>
                    
                    {msg.text && <p className="message-text">{msg.text}</p>}
                    
                    {/* 📸 הצגת תמונה בפיד */}
                    {msg.image && (
                      <div style={{ marginTop: '5px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #333' }}>
                        <img 
                          src={msg.image} 
                          alt="קובץ מצורף מהפיד" 
                          style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }} 
                        />
                      </div>
                    )}

                    {/* 🎙️ הצגת נגן הקלטה קולית בפיד */}
                    {msg.audio && (
                      <div style={{ marginTop: '5px' }}>
                        <audio 
                          controls 
                          src={msg.audio} 
                          style={{ width: '100%', height: '32px' }} 
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* הודעה חלופית במידה והמשתמש אינו מחובר */
          <div 
            className="messages-feed-widget" 
            style={{ 
              padding: '20px', 
              textAlign: 'center', 
              backgroundColor: '#1a1a1a', 
              borderRadius: '12px',
              border: '1px solid #333'
            }}
          >
            <h4 style={{ color: '#ff4444', marginBottom: '10px' }}>🔒 פיד ההודעות חסום</h4>
            <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: '1.4' }}>
              עליך להתחבר לחשבונך על מנת לצפות בעדכוני המערכת והודעות בזמן אמת.
            </p>
          </div>
        )}
      </div>

      <AuthSidebar currentUser={userWithShopMethods} activeAvatar={activeAvatar} handleLoginSuccess={setCurrentUser} handleLogout={handleFakeLogout} />

      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/dashboard" element={<Dashboard messages={messages} />} />
        <Route path="/games" element={<GameManager currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} /> 
        <Route path="/profile" element={<Profile currentUser={currentUser} updateUserPoints={updateUserPoints} />} />
        <Route path="/messages" element={<Messages addMessage={addMessage} deleteMessage={deleteMessage} messages={messages} currentUser={userWithShopMethods} />} />        
        <Route path="/security" element={<Security currentUser={userWithShopMethods} />} />
        <Route path="/shop" element={<Shop currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} /> 
        <Route path="/quizzes" element={<Quizzes currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} onSaveQuizResult={handleSaveQuizResult} />} />
        <Route path="/math-topic/:id" element={<MathTopicScreen currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} />
        <Route path="/whatsapp" element={<WhatsAppIntegration currentUser={userWithShopMethods} />} />
        <Route path="/games/puzzle" element={<PuzzleGame currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} />
        <Route path="/games/memory" element={<MemoryGame currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} />
        <Route path="/games/tetris" element={<TetrisGame currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} />
        <Route path="/games/connect4" element={<ConnectFourGame currentUser={userWithShopMethods} updateUserPoints={updateUserPoints} />} />
      </Routes>
    </div>
  );
}

export default App;