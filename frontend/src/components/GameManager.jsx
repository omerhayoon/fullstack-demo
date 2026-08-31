import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGamepad, FaPuzzlePiece, FaBrain, FaRocket } from 'react-icons/fa';
import { GiBrickWall } from 'react-icons/gi';
import TetrisGame from './games/TetrisGame';
import ConnectFourGame from './games/ConnectFourGame';
import { FaMask } from 'react-icons/fa'; // או FaShieldAlt

function GameManager({ currentUser, updateUserPoints }) {
  const navigate = useNavigate();
  const [activeGame, setActiveGame] = useState(null);

  const games = [
    { id: 1, title: 'פאזלים', icon: <FaPuzzlePiece />, path: '/games/puzzle' },
    { id: 2, title: 'משחק הזיכרון', icon: <FaBrain />, path: '/games/memory' },
    { id: 3, title: '4 בשורה', icon: <FaGamepad />, category: 'ארקייד', internal: 'connect4' },
    { id: 4, title: 'טטריס', icon: <GiBrickWall />, internal: 'tetris' },
    { id: 5, title: 'אתגר מארוול',  icon: <FaMask />, category: 'אתגר', path: '/games/game-5' } ,
       { id: 6, title: 'מהירות', icon: <FaRocket />, category: 'מהירות', path: '/games/game-6' },
    
  ];

  const handleCardItemClick = (game) => {
    if (game.internal === 'tetris') {
      setActiveGame('tetris');
    } else if (game.internal === 'connect4') {
      setActiveGame('connect4');
    } else if (game.path) {
      navigate(game.path);
    }
  };

  if (activeGame === 'tetris') {
    return (
      <TetrisGame
        onBack={() => setActiveGame(null)}
        updateUserPoints={updateUserPoints}
      />
    );
  }

  if (activeGame === 'connect4') {
    return (
      <ConnectFourGame
        onBack={() => setActiveGame(null)}
        currentUser={currentUser}
        updateUserPoints={updateUserPoints}
      />
    );
  }

  return (
    <div className="page-container">
      <header className="hero-section">
        <h1 className="main-title">מרכז המשחקים</h1>
        <p className="subtitle">
          {currentUser
            ? `שלום ${currentUser.name || currentUser.username}! בחר משחק, צבור נקודות ואתגר את עצמך`
            : 'בחר משחק והתחל לאתגר את הזיכרון והחשיבה'}
        </p>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          width: '100%'
        }}>
          {games.map((game) => (
            <div
              key={game.id}
              className="card-item"
              onClick={() => handleCardItemClick(game)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#1a1a1e',
                border: '1px solid #2d2d35',
                borderRadius: '12px',
                padding: '25px 20px',
                textAlign: 'center',
                transition: 'transform 0.2s, border-color 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <div className="card-icon" style={{ fontSize: '2.5rem', color: '#0cf304' }}>
                {game.icon}
              </div>
              <div className="card-info">
                {game.category && (
                  <span className="card-tag" style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '4px' }}>
                    {game.category}
                  </span>
                )}
                <h3 className="card-title" style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
                  {game.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => navigate('/')} className="action-button back-btn" style={{ marginTop: '20px' }}>
        חזרה למסך הבית
      </button>
    </div>
  );
}

export default GameManager;