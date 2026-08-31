import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Messages({ addMessage, deleteMessage, messages, currentUser }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [text, setText] = useState('');
  const [imageB64, setImageB64] = useState(null);
  const [audioB64, setAudioB64] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioB64(reader.result);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("לא ניתן להשתמש במיקרופון. אנא ודא שניתנו הרשאות מתאימות.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        alert("התמונה גדולה מדי! נא לבחור תמונה קטנה מ-2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageB64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('נא להתחבר למערכת כדי לפרסם הודעה!');
      return;
    }

    if (!text.trim() && !imageB64 && !audioB64) {
      alert('נא למלא תוכן הודעה, להעלות תמונה או להקליט הודעה קולית!');
      return;
    }

    addMessage(currentUser.name, text, imageB64, audioB64);
    
    setText('');
    setImageB64(null);
    setAudioB64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setSuccessMessage('ההודעה פורסמה בהצלחה ✨');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const myMessages = messages ? messages.filter(msg => msg.sender === currentUser?.name) : [];

  return (
    <div className="apple-chat-wrapper">
      {/* סגנונות CSS משולבים בקובץ */}
      <style>{`
        .apple-chat-wrapper {
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

        .apple-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .apple-header h1 {
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 8px 0;
          background: linear-gradient(180deg, #ffffff 0%, #a1a1a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .apple-header p {
          font-size: 0.95rem;
          color: #86868b;
          margin: 0;
          font-weight: 400;
        }

        .apple-layout {
          display: flex;
          gap: 24px;
          width: 100%;
          max-width: 960px;
          flex-wrap: wrap-reverse;
          justify-content: center;
        }

        .apple-panel {
          flex: 1 1 400px;
          max-width: 460px;
          height: 520px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        .panel-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #f5f5f7;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-title .count-badge {
          background: rgba(255, 255, 255, 0.1);
          color: #a1a1a6;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .messages-scroll-area {
          overflow-y: auto;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-left: 4px;
        }

        .messages-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .messages-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .messages-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }

        .apple-message-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 14px;
          transition: all 0.2s ease;
        }

        .apple-message-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .message-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .message-timestamp {
          font-size: 0.72rem;
          color: #86868b;
          font-weight: 500;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #ff453a;
          font-size: 1rem;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.2s;
          padding: 0 4px;
        }

        .delete-btn:hover {
          opacity: 1;
        }

        .message-body-text {
          font-size: 0.9rem;
          line-height: 1.45;
          color: #e5e5ea;
          margin: 0;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .apple-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 14px;
        }

        .apple-label {
          font-size: 0.8rem;
          font-weight: 500;
          color: #a1a1a6;
        }

        .apple-textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 12px;
          color: #fff;
          font-size: 0.9rem;
          resize: none;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }

        .apple-textarea:focus {
          border-color: #0a84ff;
          box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.25);
        }

        .upload-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .file-upload-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f5f5f7;
          border-radius: 12px;
          padding: 8px 14px;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .file-upload-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .record-btn {
          background: rgba(255, 69, 58, 0.15);
          color: #ff453a;
          border: 1px solid rgba(255, 69, 58, 0.3);
          border-radius: 12px;
          padding: 8px 14px;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .record-btn:hover {
          background: rgba(255, 69, 58, 0.25);
        }

        .record-btn.recording {
          background: #ff453a;
          color: #fff;
          animation: pulse-apple 1.5s infinite;
        }

        @keyframes pulse-apple {
          0% { box-shadow: 0 0 0 0 rgba(255, 69, 58, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(255, 69, 58, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 69, 58, 0); }
        }

        .preview-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 4px 8px;
          margin-top: 6px;
        }

        .apple-btn-primary {
          width: 100%;
          background: #0a84ff;
          color: #ffffff;
          border: none;
          border-radius: 14px;
          padding: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(10, 132, 255, 0.3);
        }

        .apple-btn-primary:hover {
          background: #0071e3;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(10, 132, 255, 0.4);
        }

        .apple-btn-primary:active {
          transform: translateY(0);
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
          transition: all 0.2s;
          margin-top: 28px;
        }

        .apple-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .apple-toast {
          background: rgba(48, 209, 88, 0.2);
          border: 1px solid rgba(48, 209, 88, 0.4);
          color: #30d158;
          text-align: center;
          padding: 8px;
          border-radius: 10px;
          font-size: 0.82rem;
          margin-top: 10px;
          font-weight: 500;
        }
      `}</style>

      <header className="apple-header">
        <h1>הודעות וצ'אט</h1>
        <p>ניהול הודעות, קבצי מדיה והקלטות קוליות</p>
      </header>

      {!currentUser ? (
        <div className="apple-glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', fontWeight: 500, color: '#ff453a' }}>
            גישה מוגבלת
          </h3>
          <p style={{ color: '#86868b', fontSize: '0.9rem', margin: 0 }}>
            כדי לכתוב ולצפות בהודעות, עליך להתחבר לחשבונך.
          </p>
        </div>
      ) : (
        <div className="apple-layout">
          
          {/* panel: my messages */}
          <div className="apple-glass-card apple-panel">
            <div className="panel-title">
              <span>ההודעות שלך</span>
              <span className="count-badge">{myMessages.length}</span>
            </div>
            
            <div className="messages-scroll-area">
              {myMessages.length === 0 ? (
                <div style={{ color: '#86868b', textAlign: 'center', margin: 'auto 0', fontSize: '0.88rem' }}>
                  טרם פורסמו הודעות
                </div>
              ) : (
                myMessages.map((msg) => (
                  <div key={msg.id} className="apple-message-item">
                    <div className="message-meta">
                      <span className="message-timestamp">{msg.date} • {msg.time}</span>
                      <button 
                        onClick={() => deleteMessage(msg.id)} 
                        className="delete-btn"
                        title="מחק הודעה"
                      >
                        ✕
                      </button>
                    </div>
                    
                    {msg.text && (
                      <p className="message-body-text">{msg.text}</p>
                    )}

                    {msg.image && (
                      <div style={{ marginTop: '10px', borderRadius: '12px', overflow: 'hidden' }}>
                        <img src={msg.image} alt="קובץ מצורף" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }} />
                      </div>
                    )}

                    {msg.audio && (
                      <div style={{ marginTop: '10px' }}>
                        <audio controls src={msg.audio} style={{ width: '100%', height: '36px' }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* panel: create message */}
          <div className="apple-glass-card apple-panel" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="panel-title">
                <span>יצירת הודעה</span>
                <span style={{ fontSize: '0.8rem', color: '#86868b', fontWeight: 400 }}>
                  יוזר מחובר: <strong style={{ color: '#f5f5f7' }}>{currentUser.name}</strong>
                </span>
              </div>

              <form onSubmit={handleSubmit} id="msg-form">
                <div className="apple-input-group">
                  <label className="apple-label" htmlFor="text-input">תוכן ההודעה</label>
                  <textarea
                    id="text-input"
                    placeholder="מה ברצונך לשתף?..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="apple-textarea"
                    rows={3}
                  />
                </div>

                {/* Media controls */}
                <div className="apple-input-group">
                  <label className="apple-label">מדיה וקול</label>
                  <div className="upload-row">
                    <button 
                      type="button" 
                      className="file-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      📷 {imageB64 ? 'החלף תמונה' : 'צרף תמונה'}
                    </button>
                    <input 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />

                    {!isRecording ? (
                      <button 
                        type="button" 
                        onClick={startRecording}
                        className="record-btn"
                      >
                        🎙️ הקלט
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        onClick={stopRecording}
                        className="record-btn recording"
                      >
                        ⏹️ סיום הקלטה
                      </button>
                    )}
                  </div>
                </div>

                {/* Previews */}
                {imageB64 && (
                  <div className="preview-chip">
                    <img src={imageB64} alt="תצוגה מקדימה" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '6px' }} />
                    <span style={{ fontSize: '0.75rem', color: '#a1a1a6' }}>תמונה צורפה</span>
                    <button 
                      type="button"
                      onClick={() => { setImageB64(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                      style={{ background: 'none', border: 'none', color: '#ff453a', cursor: 'pointer', padding: '0 4px' }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {audioB64 && (
                  <div className="preview-chip" style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'space-between' }}>
                    <audio controls src={audioB64} style={{ height: '30px', maxWidth: '80%' }} />
                    <button 
                      type="button"
                      onClick={() => setAudioB64(null)}
                      style={{ background: 'none', border: 'none', color: '#ff453a', cursor: 'pointer', padding: '0 4px' }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button type="submit" form="msg-form" className="apple-btn-primary">
                פרסם הודעה
              </button>

              {successMessage && (
                <div className="apple-toast">
                  {successMessage}
                </div>
              )}
            </div>
          </div>

        </div>
      )}
      
      <button onClick={handleBackToHome} className="apple-btn-secondary">
        חזרה למסך הבית
      </button>
    </div>
  );
}

export default Messages;