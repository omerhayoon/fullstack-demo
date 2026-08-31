import { useNavigate } from 'react-router-dom';
import { 
  AiOutlineDashboard, 
  AiOutlineUser, 
  AiOutlineMessage, 
  AiOutlinePercentage,
  AiOutlineForm,     // 📝 אייקון מתאים למבחנים ומשימות
  AiOutlineGift,     
    
} from "react-icons/ai";
import { FaWhatsapp } from 'react-icons/fa';
import { FaPuzzlePiece } from "react-icons/fa";


function HomeScreen() {
  const navigate = useNavigate();
  
  const cards = [
    // --- שורה ראשונה (4 כרטיסיות מקוריות) ---
    { id: 1, title: "מדדים ", icon: <AiOutlineDashboard />, path: "/dashboard", category: "נתונים" },
    { id: 2, title: "הישגים וסטטיסטיקה ", icon: <AiOutlineUser />, path: "/profile", category: "פרופיל" },
    { id: 3, title: "הודעות וצ'אט", icon: <AiOutlineMessage />, path: "/messages", category: "קהילה" },
    { id: 4, title: "תרגול מתמטיקה", icon: <AiOutlinePercentage />, path: "/security", category: "לימודים" }, 
    
    // --- שורה שנייה (4 כרטיסיות חדשות) ---
    { id: 5, title: "מבחנים ומשימות", icon: <AiOutlineForm />, path: "/quizzes", category: "תחרות" },
    { id: 6, title: "חנות פרסים ונקודות", icon: <AiOutlineGift />, path: "/shop", category: "פרסים" },
    { id: 7, title: "חיבור ל-WhatsApp", icon: <FaWhatsapp style={{ color: '#25D366' }} />, path: "/whatsapp", category: "תקשורת" },
    { id: 8,title: "משחקי חשיבה", icon: <FaPuzzlePiece />,path: "/games", category: "משחקים",},

  ];

  return (
    <div className="page-container">
      <header className="hero-section">
        <h1 className="main-title">TRY & LEARN </h1>
        
      </header>
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        width: '100%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '20px', 
          width: '100%'
        }}>
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="card-item"
              onClick={() => navigate(card.path)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-icon">{card.icon}</div>
              <div className="card-info">
                <span className="card-tag">{card.category || "קטגוריה"}</span>
                <h3 className="card-title">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        color: '#888',
        fontSize: '14px'
      }}>
        © {new Date().getFullYear()} Omer Hayoon. All rights reserved 
      </div>
    </div>
  );
}

export default HomeScreen;