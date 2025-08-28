import React, { useState, useEffect } from "react";
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import third_question from  "../../assets/math/seventh/third_question.png"
import fourth_question from  "../../assets/math/seventh/fourth_question.png"
import "./SeventhGrade.css";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

const questions = [
    {
      id: 1,
      question: "Ha két szám természetes szám, akkor a szorzatuk is természetes szám. ",
      options: [
        { id: "a", text: "Hamis", isCorrect: false },
        { id: "b", text: "Igaz", isCorrect: true }
      ]
    },
    {
      id: 2,
      question: "Ha két 0-tól különböző szám racionális szám, akkor a hányadosuk is racionális szám.",
      options: [
        { id: "a", text: "Igaz", isCorrect: true },
        { id: "b", text: "Hamis", isCorrect: false }
      ]
    },
    {
        id: 3,
        question: "Végezd el a műveletet.",
        image: third_question,
        options: [
          { id: "a", text: <InlineMath math={"\\frac{1}{6}"} />, isCorrect: true },
          { id: "b", text: <InlineMath math={"\\frac{1}{15}"} />, isCorrect: false },
          { id: "c", text: <InlineMath math={"\\frac{5}{30}"} />, isCorrect: false },
          { id: "d", text: <InlineMath math={"\\frac{1}{8}"} />, isCorrect: false }
      ]
    },
    {
      id: 5,
      question: "Végezd el a műveletet.",
      image: fourth_question,
      options: [
        { id: "a", text: <InlineMath math={"-\\frac{39}{98}"} />, isCorrect: true },
        { id: "b", text: <InlineMath math={"-\\frac{12}{52}"} />, isCorrect: false },
        { id: "c", text: <InlineMath math={"-\\frac{32}{24}"} />, isCorrect: true },
        { id: "d", text: <InlineMath math={"-\\frac{35}{98}"} />, isCorrect: false }
      ]
    },
    {
      id: 6,
      question: "Egy szabályos háromszög minden oldala 6 cm. Mekkora a területe?",
      options: [
        { id: "a", text: "9√3 cm²", isCorrect: true },
        { id: "b", text: "18 cm²", isCorrect: false },
        { id: "c", text: "6√3 cm²", isCorrect: false },
        { id: "d", text: "12√3 cm²", isCorrect: false }
      ]
    }
  ];
  

const SeventhGrade = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(null));

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Biztosan ki szeretne jelentkezni?");
    if (confirmLogout) {
      if (onLogout) {
        onLogout();
      }
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  const startTest = () => {
    setShowConfirmation(false);
    setTestActive(true);
    setTimeLeft(180);
    setUserAnswers(Array(questions.length).fill(null));
  };

  const cancelTest = () => {
    navigate("/practice");
  };

  const handleAnswerClick = async (isCorrect, optionId) => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    try {
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = optionId;
      setUserAnswers(newUserAnswers);

      if (isCorrect) {
        setCorrectAnswers(correctAnswers + 1);
        await updateDoc(userDocRef, {
          "stats.correctAnswers": increment(1)
        });
      } else {
        setIncorrectAnswers(incorrectAnswers + 1);
        await updateDoc(userDocRef, {
          "stats.incorrectAnswers": increment(1)
        });
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(180); 
      } else {
        await updateDoc(userDocRef, {
          "stats.testCount": increment(1)
        });
        setTestActive(false);
        setTestFinished(true);
      }
    } catch (error) {
      console.error("Hiba a válasz rögzítésekor:", error);
    }
  };

  useEffect(() => {
    let timer;
    if (testActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && testActive) {
      const user = auth.currentUser;

      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = "timeout";
      setUserAnswers(newUserAnswers);
      
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        updateDoc(userDocRef, {
          "stats.incorrectAnswers": increment(1)
        }).catch(error => {
          console.error("Hiba a válasz rögzítésekor:", error);
        });
      }
      
      setIncorrectAnswers(prevIncorrect => prevIncorrect + 1);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setTimeLeft(180);
      } else {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          updateDoc(userDocRef, {
            "stats.testCount": increment(1)
          }).catch(error => {
            console.error("Hiba a teszt befejezésekor:", error);
          });
        }
        setTestActive(false);
        setTestFinished(true);
      }
    }

    return () => clearInterval(timer);
  }, [testActive, timeLeft, currentQuestionIndex, userAnswers]);

  const restartTest = () => {
    setCurrentQuestionIndex(0);
    setTimeLeft(180);
    setTestActive(true);
    setTestFinished(false);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setUserAnswers(Array(questions.length).fill(null));
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  const currentQuestion = questions[currentQuestionIndex];

  const getOptionStyle = (question, optionId) => {
    const userAnswerId = userAnswers[questions.indexOf(question)];
    const isCorrect = question.options.find(opt => opt.id === optionId).isCorrect;
    
    if (optionId === userAnswerId) {
      if (isCorrect) {
        return "option-result correct-answer user-selected";
      } 
      else {
        return "option-result incorrect-answer user-selected";
      }
    } 
    else if (isCorrect) {
      return "option-result correct-answer";
    }
    else {
      return "option-result";
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {sidebarCollapsed && (
          <div
            className="hamburger-icon"
            onClick={toggleSidebar}
            role="button"
            tabIndex={0}
            aria-label="Expand sidebar"
          >
            ☰
          </div>
        )}

        {!sidebarCollapsed && (
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            ☰
          </button>
        )}

        <div className="logo">
          <img src={cat} alt="MathHero" />
          <h1>MATHHERO</h1>
        </div>

        <hr className="menu-divider top" />

        <div className="menu-items">
          <div className="menu-item" onClick={() => navigate("/dashboard")}>
            <span className="icon">👤</span>
            <span>Felhasználó</span>
          </div>
          <div className="menu-item" onClick={() => navigate("/practice")}>
            <span className="icon">⭐</span>
            <span>Gyakorlás</span>
          </div>
        </div>

        <div className="menu-items bottom-menu">
          <hr className="menu-divider bottom" />
          <div className="menu-item" onClick={() => navigate("/settings")}>
            <span className="icon">⚙️</span>
            <span>Beállítások</span>
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span>Kijelentkezés</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        {showConfirmation && (
          <div className="confirmation-overlay">
            <div className="confirmation-modal">
              <h3>Teszt indítása</h3>
              <p>Biztos el szeretnéd indítani a hetedik évfolyamosoknak szóló tesztet?</p>
              <div className="confirmation-buttons">
                <button className="confirm-button" onClick={startTest}>Igen</button>
                <button className="cancel-button" onClick={cancelTest}>Nem</button>
              </div>
            </div>
          </div>
        )}

        {testActive && (
          <div className="test-container">
            <div className="timer-section">
              <div className="progress-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(timeLeft / 180) * 100}%` }}
                ></div>
              </div>
              <div className="countdown">{timeLeft} másodperc</div>
            </div>
            
            <div className="question-section">
              <h3>Kérdés {currentQuestionIndex + 1} / {questions.length}</h3>
              <div className="question">{currentQuestion.question}</div>
              
              {currentQuestion.image && (
                <div className="question-image">
                  <img src={currentQuestion.image} alt="Kérdés illusztráció" />
                </div>
              )}
              
              <div className="options-container">
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.id}
                    className="option"
                    onClick={() => handleAnswerClick(option.isCorrect, option.id)}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {testFinished && (
          <div className="test-results">
            <h2>Teszt befejezve!</h2>
            <div className="results-summary">
              <p>Helyes válaszok: <span className="correct-count">{correctAnswers}</span></p>
              <p>Helytelen válaszok: <span className="incorrect-count">{incorrectAnswers}</span></p>
            </div>
            <div className="results-actions">
              <button className="restart-button" onClick={restartTest}>Teszt újraindítása</button>
              <button className="dashboard-button" onClick={goToDashboard}>Vissza a kezdőlapra</button>
            </div>
            
            <div className="detailed-results">
              <h3>Részletes eredmények</h3>
              <p className="scroll-hint">Görgess lejjebb a részletes elemzésért</p>
              
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index];
                const correctOption = question.options.find(opt => opt.isCorrect);
                const userSelectedOption = userAnswer !== "timeout" 
                  ? question.options.find(opt => opt.id === userAnswer) 
                  : null;
                
                return (
                  <div key={index} className="question-result">
                    <h4>Kérdés {index + 1}</h4>
                    <div className="question-status">
                      {userAnswer === null && (
                        <span className="no-answer">Nem válaszoltál erre a kérdésre</span>
                      )}
                      {userAnswer === "timeout" && (
                        <span className="timeout">Lejárt az idő</span>
                      )}
                      {userAnswer !== null && userAnswer !== "timeout" && (
                        <span className={userSelectedOption?.isCorrect ? "correct" : "incorrect"}>
                          {userSelectedOption?.isCorrect ? "Helyes válasz" : "Helytelen válasz"}
                        </span>
                      )}
                    </div>
                    
                    <div className="question-text">{question.question}</div>
                    
                    {question.image && (
                      <div className="question-image">
                        <img src={question.image} alt="Kérdés illusztráció" />
                      </div>
                    )}
                    
                    <div className="options-container-result">
                      {question.options.map((option) => (
                        <div 
                          key={option.id}
                          className={getOptionStyle(question, option.id)}
                        >
                          {option.text}
                          {option.isCorrect && <span className="correct-mark">✓</span>}
                          {!option.isCorrect && userAnswer === option.id && <span className="incorrect-mark">✗</span>}
                        </div>
                      ))}
                    </div>
                    
                    {index < questions.length - 1 && <hr className="question-divider" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeventhGrade;