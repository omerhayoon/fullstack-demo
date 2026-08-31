import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AiOutlineClockCircle, AiOutlineBook, AiOutlinePlayCircle, AiOutlineTrophy, AiOutlineReload } from "react-icons/ai";

// -------------------------------------------------------------
// רכיב פנימי לניהול מהלך המבחן, הטיימר והשאלות
// -------------------------------------------------------------
function QuizRunner({ quiz, currentUser, onFinishQuiz, onWinReward }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(quiz.duration * 60);
  const [isExamFinished, setIsExamFinished] = useState(false);

  const correctAnswersRef = useRef(correctAnswersCount);
  useEffect(() => {
    correctAnswersRef.current = correctAnswersCount;
  }, [correctAnswersCount]);

  const saveQuizResult = useCallback((correctCount, passed, timeSpentSec) => {
    if (!currentUser) return;

    const username = currentUser.username || currentUser.name || currentUser.email || 'guest';
    const historyKey = `quiz_history_${username}`;
    
    const existingHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    
    const elapsedSeconds = (quiz.duration * 60) - timeSpentSec;
    const mins = Math.floor(Math.max(0, elapsedSeconds) / 60);
    const secs = Math.max(0, elapsedSeconds) % 60;
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const newEntry = {
      quizTitle: quiz.title,
      correctCount,
      totalQuestions: quiz.questions,
      passed,
      timeSpent: formattedTime,
      date: new Date().toLocaleDateString('he-IL')
    };

    const updatedHistory = [newEntry, ...existingHistory];
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
  }, [currentUser, quiz.duration, quiz.title, quiz.questions]);

  const [questions] = useState(() => {
    const generated = [];

    const createQuestion = (questionType, id) => {
      let num1, num2, correctAnswer, optionsSet = new Set(), questionText;

      if (questionType === 1) {
        num1 = Math.floor(Math.random() * 50) + 10;
        num2 = Math.floor(Math.random() * 40) + 1;
        const isAddition = Math.random() > 0.5;
        correctAnswer = isAddition ? num1 + num2 : num1 - num2;
        questionText = `${num1} ${isAddition ? '+' : '-'} ${num2} = ?`;

        optionsSet.add(correctAnswer);
        optionsSet.add(correctAnswer + 2);
        optionsSet.add(correctAnswer - 2);
        optionsSet.add(correctAnswer + 5);
      } else if (questionType === 2) {
        const isMultiplication = Math.random() > 0.5;
        if (isMultiplication) {
          num1 = Math.floor(Math.random() * 9) + 2;
          num2 = Math.floor(Math.random() * 9) + 2;
          correctAnswer = num1 * num2;
          questionText = `${num1} × ${num2} = ?`;

          optionsSet.add(correctAnswer);
          optionsSet.add(correctAnswer + num1);
          optionsSet.add(correctAnswer + num2);
          optionsSet.add((num1 + 1) * num2);
        } else {
          num2 = Math.floor(Math.random() * 9) + 2;
          correctAnswer = Math.floor(Math.random() * 9) + 2;
          num1 = num2 * correctAnswer;
          questionText = `${num1} ÷ ${num2} = ?`;

          optionsSet.add(correctAnswer);
          optionsSet.add(correctAnswer + 1);
          optionsSet.add(Math.max(1, correctAnswer - 1));
          optionsSet.add(correctAnswer + 3);
        }
      } else {
        const eqType = Math.floor(Math.random() * 3);
        
        if (eqType === 0) {
          correctAnswer = Math.floor(Math.random() * 15) + 2;
          const a = Math.floor(Math.random() * 20) + 3;
          const b = correctAnswer + a;
          questionText = `x + ${a} = ${b}\nx = ?`;
        } else if (eqType === 1) {
          correctAnswer = Math.floor(Math.random() * 20) + 5;
          const a = Math.floor(Math.random() * (correctAnswer - 1)) + 1;
          const b = correctAnswer - a;
          questionText = `x - ${a} = ${b}\nx = ?`;
        } else {
          correctAnswer = Math.floor(Math.random() * 10) + 2;
          const a = Math.floor(Math.random() * 8) + 2;
          const b = a * correctAnswer;
          questionText = `${a}x = ${b}\nx = ?`;
        }

        optionsSet.add(correctAnswer);
        optionsSet.add(correctAnswer + 2);
        optionsSet.add(Math.max(1, correctAnswer - 2));
        optionsSet.add(correctAnswer + 5);
      }

      const options = Array.from(optionsSet);
      while (options.length < 4) {
        const rand = Math.floor(Math.random() * 30) + 1;
        if (!options.includes(rand)) options.push(rand);
      }

      options.sort(() => Math.random() - 0.5);

      return {
        id,
        questionText,
        options,
        correctAnswer
      };
    };

    let typesPattern = [];

    if (quiz.id === 4) {
      typesPattern = [
        ...Array(5).fill(1),
        ...Array(5).fill(2),
        ...Array(10).fill(3)
      ];
      typesPattern.sort(() => Math.random() - 0.5);
    } else {
      typesPattern = Array(quiz.questions).fill(quiz.id);
    }

    typesPattern.forEach((type, index) => {
      generated.push(createQuestion(type, index + 1));
    });

    return generated;
  });

  const completeQuiz = useCallback((finalCorrectCount) => {
    setIsExamFinished(true);
    const passPercentage = 80;
    const scorePercentage = Math.round((finalCorrectCount / quiz.questions) * 100);
    const passed = scorePercentage >= passPercentage;

    saveQuizResult(finalCorrectCount, passed, timeLeft);

    if (passed) {
      if (typeof onWinReward === 'function') {
        onWinReward(quiz.rewardPoints);
      }

      Swal.fire({
        title: 'כל הכבוד! עברת את המבחן! 🎉',
        html: `
          <p style="font-size: 1rem; margin-top: 10px;">
            ענית נכון על <strong>${finalCorrectCount}</strong> מתוך <strong>${quiz.questions}</strong> שאלות.
          </p>
          <p style="font-size: 1.2rem; color: #28a745; font-weight: bold; margin-top: 15px;">
            ציון סופי: ${scorePercentage}% (נדרש 80%)
          </p>
          <p style="font-size: 1.1rem; color: #ffd700; font-weight: bold; margin-top: 10px;">
            🏆 זכית ב-${quiz.rewardPoints} נקודות נוספות!
          </p>
        `,
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#28a745',
        confirmButtonText: 'חזרה למבחנים'
      }).then(() => onFinishQuiz());
    } else {
      Swal.fire({
        title: 'לא נורא, אולי בפעם הבאה... 😕',
        html: `
          <p style="font-size: 1rem; margin-top: 10px;">
            ענית נכון על <strong>${finalCorrectCount}</strong> מתוך <strong>${quiz.questions}</strong> שאלות.
          </p>
          <p style="font-size: 1.2rem; color: #ff4444; font-weight: bold; margin-top: 15px;">
            ציון סופי: ${scorePercentage}% (נדרש 80% כדי לעבור)
          </p>
        `,
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#007bff',
        confirmButtonText: 'חזרה למבחנים'
      }).then(() => onFinishQuiz());
    }
  }, [quiz.questions, quiz.rewardPoints, onFinishQuiz, onWinReward, saveQuizResult, timeLeft]);

  const handleTimeOut = useCallback(() => {
    setIsExamFinished(true);

    saveQuizResult(correctAnswersRef.current, false, 0);

    Swal.fire({
      title: 'הזמן הסתיים! ⏰',
      text: 'לצערי הוקצב זמן מקסימלי למבחן והזמן נגמר. המבחן נפסל.',
      icon: 'warning',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#ff4444',
      confirmButtonText: 'חזרה לרשימת המבחנים'
    }).then(() => onFinishQuiz());
  }, [onFinishQuiz, saveQuizResult]);

  useEffect(() => {
    if (isExamFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamFinished, handleTimeOut]);

  const handleAnswerSelect = (selectedOption) => {
    if (isExamFinished) return;

    const currentQ = questions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQ.correctAnswer;
    const nextCorrectCount = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;

    if (isCorrect) {
      setCorrectAnswersCount(nextCorrectCount);
    }

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeQuiz(nextCorrectCount);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '15px' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <div style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '15px',
          border: '1px solid #333',
          direction: 'ltr',
          boxSizing: 'border-box'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: timeLeft < 60 ? '#ff4444' : '#ffd700',
            fontSize: '1.1rem',
            fontWeight: 'bold'
          }}>
            <AiOutlineClockCircle />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <div style={{ color: '#aaa', fontSize: '0.9rem', direction: 'rtl' }}>
            שאלה <strong style={{ color: '#fff' }}>{currentQuestionIndex + 1}</strong> מתוך <strong style={{ color: '#fff' }}>{quiz.questions}</strong>
          </div>
        </div>

        <div className="dash-card" style={{
          backgroundColor: '#1a1a1a',
          padding: '25px 20px',
          borderRadius: '10px',
          border: '1px solid #333',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            color: '#fff', 
            marginBottom: '20px', 
            fontSize: '1.6rem', 
            lineHeight: '1.5'
          }}>
            {currentQuestion.questionText.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                <span dir="ltr" style={{ display: 'inline-block' }}>
                  {line}
                </span>
                {idx === 0 && currentQuestion.questionText.includes('\n') && <br />}
              </React.Fragment>
            ))}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(option)}
                className="quiz-option-btn"
                style={{
                  padding: '12px',
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  direction: 'ltr',
                  transition: 'all 0.2s ease'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// הרכיב הראשי Quizzes
// -------------------------------------------------------------
function Quizzes({ currentUser, updateUserPoints }) {
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState(null);

  const userId = currentUser?.id || currentUser?.email || currentUser?.name || 'guest';

  const [userQuizCounts, setUserQuizCounts] = useState(() => {
    if (!userId || userId === 'guest') return {};
    const saved = localStorage.getItem(`quiz_attempts_${userId}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (userId && userId !== 'guest') {
      const saved = localStorage.getItem(`quiz_attempts_${userId}`);
      setUserQuizCounts(saved ? JSON.parse(saved) : {});
    }
  }, [userId]);

  const [quizzes] = useState([
    { id: 1, title: "מבחן מסכם: חיבור וחיסור", category: "חשבון בסיסי", questions: 10, duration: 1, difficulty: "קל", pointsPrice: 50, rewardPoints: 100 },
    { id: 2, title: "מבחן מסכם: לוח הכפל", category: "כפל וחילוק", questions: 15, duration: 2, difficulty: "בינוני", pointsPrice: 200, rewardPoints: 300 },
    { id: 3, title: "מבחן מסכם: משוואות עם נעלם אחד", category: "אלגברה", questions: 20, duration: 2, difficulty: "בינוני", pointsPrice: 300, rewardPoints: 400 },
    { id: 4, title: "מבחן מסכם: חיבור חיסור, כפל, משוואות", category: "אלגברה", questions: 20, duration: 2, difficulty: "קשה", pointsPrice: 500, rewardPoints: 650 },
  ]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleResetAttempts = async () => {
    if (!userId || userId === 'guest') return;

    const result = await Swal.fire({
      title: 'ללחוץ לאיפוס? 🔄',
      text: 'פעולה זו תאפס את היסטוריית כמות המבחנים שביצעת ל-0.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'כן, אפס הכל',
      cancelButtonText: 'ביטול',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#ff4444',
      cancelButtonColor: '#6c757d'
    });

    if (result.isConfirmed) {
      setUserQuizCounts({});
      localStorage.removeItem(`quiz_attempts_${userId}`);

      Swal.fire({
        title: 'אופסן בהצלחה! ✨',
        text: 'כל מוני המבחנים שלך אופסו ל-0.',
        icon: 'success',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#28a745',
        timer: 1500
      });
    }
  };

  const handleStartQuiz = async (quiz) => {
    const userPoints = currentUser?.points !== undefined ? currentUser.points : 0;

    if (userPoints < quiz.pointsPrice) {
      Swal.fire({
        title: 'אין לך מספיק נקודות! 💰',
        text: `חסרות לך ${quiz.pointsPrice - userPoints} נקודות כדי להתחיל את המבחן "${quiz.title}".`,
        icon: 'error',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#007bff',
        confirmButtonText: 'הבנתי'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'להתחיל את המבחן? 🤔',
      text: `המבחן עולה ${quiz.pointsPrice} נקודות, ואם תעבור תרוויח ${quiz.rewardPoints} נקודות!`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'כן, שלם והתחל!',
      cancelButtonText: 'ביטול',
      background: '#1a1a1a',
      color: '#fff',
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#ff4444'
    });

    if (!result.isConfirmed) return;

    const updatedCounts = {
      ...userQuizCounts,
      [quiz.id]: (userQuizCounts[quiz.id] || 0) + 1
    };
    setUserQuizCounts(updatedCounts);

    if (userId !== 'guest') {
      localStorage.setItem(`quiz_attempts_${userId}`, JSON.stringify(updatedCounts));
    }

    if (typeof updateUserPoints === 'function') {
      updateUserPoints(-quiz.pointsPrice);
    }

    setActiveQuiz(quiz);
  };

  if (!currentUser) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px' }}>
        <header className="hero-section" style={{ width: '100%', textAlign: 'center', marginBottom: '15px' }}>
          <h1 className="main-title" style={{ fontSize: '1.8rem' }}>משימות ומבחנים</h1>
          <p className="subtitle" style={{ color: '#ff4444', fontSize: '0.9rem' }}>🚫 הגישה חסומה לאורחים</p>
        </header>

        <div className="dash-card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center', padding: '20px' }}>
          <h3 style={{ marginBottom: '10px', color: '#fff', fontSize: '1.1rem' }}>
            כדי לצפות במבחנים האישיים שלך ולפתור משימות, עליך להתחבר למערכת תחילה.
          </h3>
          <p style={{ color: '#aaa', fontSize: '0.85rem' }}>
            אנא השתמש בחלונית ההתחברות שבמסך הבית על מנת להיכנס לחשבונך.
          </p>
        </div>
        
        <button onClick={handleBackToHome} className="action-button back-btn" style={{ marginTop: '20px', padding: '8px 20px', fontSize: '0.9rem' }}>
          חזרה למסך הבית
        </button>
      </div>
    );
  }

  if (activeQuiz) {
    return (
      <QuizRunner 
        quiz={activeQuiz} 
        currentUser={currentUser}
        onFinishQuiz={() => setActiveQuiz(null)} 
        onWinReward={(reward) => {
          if (typeof updateUserPoints === 'function') {
            updateUserPoints(reward);
          }
        }}
      />
    );
  }

  const userPoints = currentUser.points !== undefined ? currentUser.points : 0;

  return (
    <div className="page-container" style={{ 
      padding: '15px 20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      maxHeight: '100vh',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between'
    }}>
      <header className="hero-section" style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 className="main-title" style={{ fontSize: '1.8rem', color: '#fff', margin: '0 0 5px 0' }}>מבחנים  במתמטיקה</h1>
        <p className="subtitle" style={{ color: '#aaa', fontSize: '0.9rem', margin: 0 }}>
          שלום {currentUser.name || 'תלמיד'}, יתרת הנקודות שלך: <strong style={{ color: '#ffd700' }}>{userPoints} נקודות</strong>
        </p>
      </header>

      {/* כפתור איפוס המבחנים - מעל הכרטיסיות */}
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'flex-start' }}>
        <button
          onClick={handleResetAttempts}
          style={{
            backgroundColor: 'transparent',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b',
            borderRadius: '15px',
            padding: '4px 12px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ff6b6b';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#ff6b6b';
          }}
        >
          <AiOutlineReload size={14} />
          איפוס כמות מבחנים
        </button>
      </div>

      {/* גריד הכרטיסיות */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '15px',
        width: '100%'
      }}>
        {quizzes.map((quiz) => {
          const attemptsCount = userQuizCounts[quiz.id] || 0;

          return (
            <div 
              key={quiz.id} 
              className="dash-card" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              <span style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                backgroundColor: quiz.difficulty === 'קל' ? '#4caf50' : quiz.difficulty === 'בינוני' ? '#ff9800' : '#f44336',
                color: '#fff'
              }}>
                {quiz.difficulty}
              </span>

              <span style={{ color: '#4caf50', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {quiz.category}
              </span>
              
              <h3 style={{ color: '#fff', margin: '6px 0 12px 0', fontSize: '1.05rem', lineHeight: '1.3', minHeight: '2.6em' }}>
                {quiz.title}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px', color: '#aaa', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AiOutlineBook style={{ color: '#4caf50' }} />
                  <span>שאלות: <strong>{quiz.questions} שאלות</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AiOutlineClockCircle style={{ color: '#4caf50' }} />
                  <span>זמן מוקצב: <strong>{quiz.duration} דקות</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff4444', fontWeight: 'bold' }}>
                  <AiOutlineTrophy style={{ color: '#ff4444' }} />
                  <span>עלות כניסה: <strong>{quiz.pointsPrice} נק'</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#08f328', fontWeight: 'bold' }}>
                  <AiOutlineTrophy style={{ color: '#0cf532' }} />
                  <span>פרס על הצלחה: <strong>{quiz.rewardPoints} נק'</strong></span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#17a2b8', fontWeight: 'bold' }}>
                  <AiOutlineReload style={{ color: '#17a2b8' }} />
                  <span>מבחנים שביצעת: <strong>{attemptsCount}</strong></span>
                </div>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="quiz-start-btn"
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '0.9rem',
                  transition: 'background-color 0.2s'
                }}
              >
                <AiOutlinePlayCircle size={16} />
                התחל מבחן
              </button>
            </div>
          );
        })}
      </div>

      {/* כפתור חזרה למסך הבית - מתחת לכרטיסיות */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button 
          onClick={handleBackToHome} 
          className="action-button back-btn"
          style={{ padding: '8px 20px', fontSize: '0.9rem' }}
        >
          חזרה למסך הבית
        </button>
      </div>
    </div>
  );
}

export default Quizzes;