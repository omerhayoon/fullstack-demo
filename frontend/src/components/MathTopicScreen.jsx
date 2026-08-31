import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mathTopics } from '../data/mathTopics'; 

// 📐 קומפוננטה להצגת שברים
function RenderFraction({ fractionStr }) {
  if (typeof fractionStr !== 'string' || !fractionStr.includes('/')) {
    return <span>{fractionStr}</span>;
  }

  const [numerator, denominator] = fractionStr.split('/');

  return (
    <div style={{ 
      display: 'inline-flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      verticalAlign: 'middle',
      padding: '0 6px',
      lineHeight: '1.1'
    }}>
      <span style={{ fontSize: '1em', fontWeight: 'bold' }}>{numerator}</span>
      <div style={{ 
        width: '100%', 
        height: '2px', 
        backgroundColor: 'currentColor', 
        margin: '3px 0',
        minWidth: '18px' 
      }} />
      <span style={{ fontSize: '1em', fontWeight: 'bold' }}>{denominator}</span>
    </div>
  );
}

// 🎨 קומפוננטה חדשה להצגת צורה ונתונים הנדסיים
function ShapeVisualizer({ shapeData }) {
  if (!shapeData) return null;

  const { type, length, width, side, base, height, area, perimeter } = shapeData;

  const strokeColor = "#007bff";
  const fillColor = "rgba(0, 123, 255, 0.1)";
  const textColor = "#ffffff";
  const accentColor = "#ffca28";

  return (
    <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
      <svg width="240" height="180" viewBox="0 0 240 180">
        
        {/* === 1. מלבן === */}
        {type === 'rectangle' && (
          <g>
            <rect x="40" y="30" width="160" height="100" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
            
            {/* אורך (צלע עליונה) */}
            {length && (
              <text x="120" y="20" fill={accentColor} fontSize="14" fontWeight="bold" textAnchor="middle">
                {length} ס"מ
              </text>
            )}
            
            {/* רוחב (צלע ימנית) */}
            {width && (
              <text x="210" y="85" fill={accentColor} fontSize="14" fontWeight="bold" textAnchor="start">
                {width} ס"מ
              </text>
            )}

            {/* נתון פנימי: שטח או היקף */}
            {area && (
              <text x="120" y="85" fill={textColor} fontSize="15" fontWeight="bold" textAnchor="middle">
                שטח: {area} סמ"ר
              </text>
            )}
            {perimeter && (
              <text x="120" y="85" fill={textColor} fontSize="15" fontWeight="bold" textAnchor="middle">
                היקף: {perimeter} ס"מ
              </text>
            )}
          </g>
        )}

        {/* === 2. ריבוע === */}
        {type === 'square' && (
          <g>
            <rect x="65" y="25" width="110" height="110" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
            
            {/* צלע עליונה */}
            {side && (
              <text x="120" y="18" fill={accentColor} fontSize="14" fontWeight="bold" textAnchor="middle">
                {side} ס"מ
              </text>
            )}

            {/* נתון פנימי: שטח או היקף */}
            {area && (
              <text x="120" y="85" fill={textColor} fontSize="15" fontWeight="bold" textAnchor="middle">
                שטח: {area} סמ"ר
              </text>
            )}
            {perimeter && (
              <text x="120" y="85" fill={textColor} fontSize="15" fontWeight="bold" textAnchor="middle">
                היקף: {perimeter} ס"מ
              </text>
            )}
          </g>
        )}

        {/* === 3. משולש ישר זווית === */}
        {type === 'triangle' && (
          <g>
            {/* מציירים משולש ישר זווית */}
            <polygon points="50,140 190,140 50,30" fill={fillColor} stroke={strokeColor} strokeWidth="3" />
            
            {/* סימון זווית ישרה */}
            <path d="M 50 125 L 65 125 L 65 140" fill="none" stroke={strokeColor} strokeWidth="2" />

            {/* ניצב בסיס (תחתון) */}
            {base && (
              <text x="120" y="160" fill={accentColor} fontSize="14" fontWeight="bold" textAnchor="middle">
                {base} ס"מ
              </text>
            )}

            {/* ניצב גובה (שמאלי) */}
            {height && (
              <text x="40" y="88" fill={accentColor} fontSize="14" fontWeight="bold" textAnchor="end">
                {height} ס"מ
              </text>
            )}

            {/* שטח בתוך המשולש */}
            {area && (
              <text x="90" y="110" fill={textColor} fontSize="14" fontWeight="bold" textAnchor="middle">
                שטח: {area} סמ"ר
              </text>
            )}
          </g>
        )}

      </svg>
    </div>
  );
}

function MathTopicScreen({ currentUser, updateUserPoints }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [feedback, setFeedback] = useState({ text: '', isCorrect: null });
  const [options, setOptions] = useState([]); 

  useEffect(() => {
    if (!currentUser) {
      alert('🔒 הגישה לתרגול חסומה לאורחים. נא להתחבר למערכת כדי להתחיל לתרגל ולצבור נקודות!');
      navigate('/security');
    }
  }, [currentUser, navigate]);

  const currentPoints = currentUser ? currentUser.points : 0;
  const currentUserName = currentUser?.name;

  const getRandomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

  const simplifyFraction = (num, den) => {
    const divisor = gcd(Math.abs(num), Math.abs(den));
    return `${num / divisor}/${den / divisor}`;
  };

  const generateOptions = (correctResult) => {
    const wrongAnswers = new Set();
    while (wrongAnswers.size < 2) {
      const offset = getRandomNumber(-5, 5);
      const fakeAns = correctResult + offset;
      if (fakeAns !== correctResult && fakeAns > 0) {
        wrongAnswers.add(fakeAns);
      }
    }
    return shuffleArray([correctResult, ...Array.from(wrongAnswers)]);
  };

  const generateMixedFractionOptions = (correctFractionStr) => {
    const [correctNum, correctDen] = correctFractionStr.split('/').map(Number);
    const wrongAnswers = new Set();

    while (wrongAnswers.size < 2) {
      const offset = getRandomNumber(-2, 2);
      const fakeNum = correctNum + offset;

      if (fakeNum > 0 && fakeNum !== correctNum) {
        wrongAnswers.add(simplifyFraction(fakeNum, correctDen));
      }
    }

    return shuffleArray([correctFractionStr, ...Array.from(wrongAnswers)]);
  };

  const generateNewExercise = () => {
    setFeedback({ text: '', isCorrect: null }); 

    let question = '';
    let correctResult = 0;
    let shapeData = null;

    // === שלב 1 ===
    if (id === '1') {
      const num1 = getRandomNumber(3, 50);
      const num2 = getRandomNumber(3, 50);
      const isAddition = Math.random() > 0.5;

      if (isAddition) {
        question = `${num1} + ${num2} = ?`;
        correctResult = num1 + num2;
      } else {
        const max = Math.max(num1, num2);
        const min = Math.min(num1, num2);
        question = `${max} - ${min} = ?`;
        correctResult = max - min;
      }
      setExercise({ question, correctResult });
      setOptions(generateOptions(correctResult));
    } 
    
    // === שלב 2 ===
    else if (id === '2') {
      const isMultiplication = Math.random() > 0.5;

      if (isMultiplication) {
        const num1 = getRandomNumber(3, 20);
        const num2 = getRandomNumber(3, 20);
        question = `${num1} × ${num2} = ?`;
        correctResult = num1 * num2;
      } else {
        const tempResult = getRandomNumber(2, 20); 
        const divisor = getRandomNumber(2, Math.floor(100 / tempResult)); 
        const dividend = divisor * tempResult;

        question = `${dividend} ÷ ${divisor} = ?`;
        correctResult = tempResult;
      }
      setExercise({ question, correctResult });
      setOptions(generateOptions(correctResult));
    }

    // === שלב 3 ===
    else if (id === '3') {
      const isAddition = Math.random() > 0.5;
      const isDifferentDenominator = Math.random() > 0.5;

      let den1 = getRandomNumber(3, 6);
      let den2 = den1;

      if (isDifferentDenominator) {
        den2 = den1 * 2; 
      }

      let num1 = getRandomNumber(1, 4);
      let num2 = getRandomNumber(1, 4);

      const commonDenominator = den2;
      const expandedNum1 = isDifferentDenominator ? num1 * 2 : num1;
      const expandedNum2 = num2;

      let finalNumerator = 0;

      if (isAddition) {
        question = `${num1}/${den1} + ${num2}/${den2} = ?`;
        finalNumerator = expandedNum1 + expandedNum2;
      } else {
        if (expandedNum1 >= expandedNum2) {
          question = `${num1}/${den1} - ${num2}/${den2} = ?`;
          finalNumerator = expandedNum1 - expandedNum2;
        } else {
          question = `${num2}/${den2} - ${num1}/${den1} = ?`;
          finalNumerator = expandedNum2 - expandedNum1;
        }
      }

      const finalCorrectFraction = simplifyFraction(finalNumerator, commonDenominator);
      
      setExercise({ question, correctResult: finalCorrectFraction });
      setOptions(generateMixedFractionOptions(finalCorrectFraction));
    }

    // === שלב 4 ===
    else if (id === '4') {
      const x = getRandomNumber(2, 10); 
      const a = getRandomNumber(2, 8);  
      const b = getRandomNumber(1, 20); 
      const isAddition = Math.random() > 0.5;

      if (isAddition) {
        const c = a * x + b;
        question = `${a}x + ${b} = ${c}`;
      } else {
        const c = a * x - b;
        question = `${a}x - ${b} = ${c}`;
      }
      
      correctResult = x; 
      setExercise({ question, correctResult });
      setOptions(generateOptions(correctResult));
    }

    // === שלב 5 ===
    else if (id === '5') {
      const isPower = Math.random() > 0.5;

      if (isPower) {
        const exponent = getRandomNumber(2, 3);
        const maxBase = exponent === 2 ? 31 : 9;
        const base = getRandomNumber(2, maxBase);

        question = `${base}^${exponent} = ?`;
        correctResult = Math.pow(base, exponent);
      } else {
        const root = getRandomNumber(2, 31);
        const perfectSquare = root * root;

        question = `√${perfectSquare} = ?`;
        correctResult = root;
      }

      setExercise({ question, correctResult });
      setOptions(generateOptions(correctResult));
    }

    // === 📐 שלב 6: הנדסה וחישובי שטחים בצורה ויזואלית 📐 ===
    else if (id === '6') {
      const shapeType = getRandomNumber(1, 3); // 1 = מלבן, 2 = ריבוע, 3 = משולש ישר זווית

      if (shapeType === 1) { // מלבן
        const length = getRandomNumber(4, 15);
        const width = getRandomNumber(3, 10);
        const subType = getRandomNumber(1, 3);

        if (subType === 1) {
          question = `לפי הנתונים שבאיור, מהו שטח המלבן (בסמ"ר)?`;
          correctResult = length * width;
          shapeData = { type: 'rectangle', length, width };
        } else if (subType === 2) {
          question = `לפי הנתונים שבאיור, מהו היקף המלבן (בס"מ)?`;
          correctResult = 2 * (length + width);
          shapeData = { type: 'rectangle', length, width };
        } else {
          const area = length * width;
          question = `לפי הנתונים שבאיור, מהו אורך המלבן (בס"מ)?`;
          correctResult = length;
          shapeData = { type: 'rectangle', width, area };
        }
      } 
      else if (shapeType === 2) { // ריבוע
        const side = getRandomNumber(3, 15);
        const subType = getRandomNumber(1, 3);

        if (subType === 1) {
          question = `לפי הנתונים שבאיור, מהו שטח הריבוע (בסמ"ר)?`;
          correctResult = side * side;
          shapeData = { type: 'square', side };
        } else if (subType === 2) {
          question = `לפי הנתונים שבאיור, מהו היקף הריבוע (בס"מ)?`;
          correctResult = 4 * side;
          shapeData = { type: 'square', side };
        } else {
          const perimeter = 4 * side;
          question = `לפי הנתונים שבאיור, מהו אורך צלע הריבוע (בס"מ)?`;
          correctResult = side;
          shapeData = { type: 'square', perimeter };
        }
      } 
      else { // משולש ישר זווית
        const base = getRandomNumber(2, 10) * 2; 
        const height = getRandomNumber(3, 12);
        const subType = getRandomNumber(1, 2);

        if (subType === 1) {
          question = `לפי הנתונים שבאיור, מהו שטח המשולש (בסמ"ר)?`;
          correctResult = (base * height) / 2;
          shapeData = { type: 'triangle', base, height };
        } else {
          const area = (base * height) / 2;
          question = `לפי הנתונים שבאיור, מהו אורך הבסיס של המשולש (בס"מ)?`;
          correctResult = base;
          shapeData = { type: 'triangle', height, area };
        }
      }

      setExercise({ question, correctResult, shapeData });
      setOptions(generateOptions(correctResult));
    }
  };

  useEffect(() => {
    if (currentUserName && ['1', '2', '3', '4', '5', '6'].includes(id)) { 
      generateNewExercise();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUserName]);

  const currentTopic = mathTopics.find(topic => topic.id === parseInt(id));

  if (!currentUser) return null;

  if (!currentTopic) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '50px' }}>
        <h2>❌ הנושא המבוקש לא נמצא במערכת</h2>
        <button onClick={() => navigate('/security')} className="action-button back-btn" style={{ marginTop: '20px' }}>
          חזרה לתפריט
        </button>
      </div>
    );
  }

  const handleOptionClick = (selectedOption) => {
    if (feedback.isCorrect) return; 

    const storageKey = `math_stats_${currentUserName}`;
    const localStats = JSON.parse(localStorage.getItem(storageKey)) || { correctAnswers: 0, wrongAnswers: 0 };

    if (selectedOption === exercise.correctResult) {
      let pointsToAward = 5; 
      if (id === '1') pointsToAward = 2;
      if (id === '2') pointsToAward = 5;
      if (id === '3') pointsToAward = 10;
      if (id === '4') pointsToAward = 10;
      if (id === '5') pointsToAward = 12;
      if (id === '6') pointsToAward = 12;
      
      setFeedback({ 
        text: id === '3'
          ? `פצצה! פתרת את השבר המורכב 🌟 (+${pointsToAward} נקודות)`
          : `כל הכבוד! תשובה נכונה מאוד 🎉 (+${pointsToAward} נקודות)`, 
        isCorrect: true 
      });

      updateUserPoints(pointsToAward);
      localStats.correctAnswers += 1;
      localStorage.setItem(storageKey, JSON.stringify(localStats));
      
      setTimeout(() => {
        generateNewExercise();
      }, 1500);
    } 
    else {
      let pointsToDeduct = 6;
      if (id === '1') pointsToDeduct = 3;
      if (id === '3') pointsToDeduct = 8; 
      if (id === '5') pointsToDeduct = 10;
      if (id === '6') pointsToDeduct = 15;
      
      setFeedback({ 
        text: `טעות, לא נורא! ירדו ${pointsToDeduct} נקודות 💔`, 
        isCorrect: false 
      });

      updateUserPoints(-pointsToDeduct);
      localStats.wrongAnswers += 1;
      localStorage.setItem(storageKey, JSON.stringify(localStats));
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header className="hero-section" style={{ width: '100%', textAlign: 'center' }}>
        <h1 className="main-title"> {currentTopic.title}</h1>
        <p className="subtitle">שלב {currentTopic.id} במערכת התרגול</p>
      </header>
      
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
        <div className="dash-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '30px' }}>
          
          {['1', '2', '3', '4', '5', '6'].includes(id) && exercise ? (
            <div>
              <div style={{ marginBottom: '20px', fontSize: '20px', color: '#aaa' }}>
                הניקוד שלך בשלב זה: <strong style={{ color: '#007bff', fontSize: '30px' }}>{currentPoints} </strong>
              </div>

              {/* הצגת צורה הנדסית עבור שלב 6 */}
              {id === '6' && exercise.shapeData && (
                <ShapeVisualizer shapeData={exercise.shapeData} />
              )}

              <h2 style={{ 
                fontSize: id === '6' ? '22px' : '40px', 
                lineHeight: '1.4',
                marginBottom: '30px', 
                color: '#fff', 
                direction: id === '6' ? 'rtl' : 'ltr', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                {id === '3' ? (
                  exercise.question.split(' ').map((part, index) => {
                    if (part.includes('/')) {
                      return <RenderFraction key={index} fractionStr={part} />;
                    }
                    return <span key={index} style={{ margin: '0 5px' }}>{part}</span>;
                  })
                ) : (
                  exercise.question
                )}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'center' }}>
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={feedback.isCorrect}
                    className="action-button"
                    style={{
                      width: '80%',
                      padding: '14px 0',
                      fontSize: '22px', 
                      fontWeight: 'bold',
                      backgroundColor: '#2b2a2a',
                      border: '2px solid #444',
                      color: '#fff',
                      borderRadius: '8px',
                      cursor: feedback.isCorrect ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',         
                      justifyContent: 'center', 
                      alignItems: 'center',     
                    }}
                    onMouseOver={(e) => {
                      if (!feedback.isCorrect) e.target.style.borderColor = '#007bff';
                    }}
                    onMouseOut={(e) => {
                      if (!feedback.isCorrect) e.target.style.borderColor = '#444';
                    }}
                  >
                    <RenderFraction fractionStr={option} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3>הכנה לאזור התרגול 🚀</h3>
              <p className="dash-placeholder" style={{ marginTop: '15px' }}>
                השלב הזה כרגע פנוי לפיתוח התרגילים הבאים.
              </p>
            </div>
          )}

          {feedback.text && (
            <div style={{ 
              marginTop: '25px', 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: feedback.isCorrect ? '#4caf50' : '#f44336' 
            }}>
              {feedback.text}
            </div>
          )}

        </div>
      </div>
      
      <button onClick={() => navigate('/security')} className="action-button back-btn" style={{ marginTop: '30px' }}>
        חזרה לתפריט הנושאים
      </button>
    </div>
  );
}

export default MathTopicScreen;