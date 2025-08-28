import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import first_question from "../../assets/math/first/first_question.png";
import second_question from "../../assets/math/first/second_question.png";
import third_question from "../../assets/math/first/third_question.png";
import fourth_question from "../../assets/math/first/fourth_question.png";
import fifth_question from "../../assets/math/first/fifth_question.png";
import "./FirstGrade.css";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

const questions = [
  {
    id: 1,
    question: "Ha Dávidnak 8 rétese van, és Tamásnak 5-tel kevesebb rétese van mint Dávidnak, hány rétesük van összesen?",
    image: first_question,
    options: [
      { id: "a", text: "10", isCorrect: false },
      { id: "b", text: "7", isCorrect: false },
      { id: "c", text: "11", isCorrect: true },
      { id: "d", text: "20", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "Mindegyik nyuszi tud enni egy káposztát?",
    image: second_question,
    options: [
      { id: "a", text: "Igen", isCorrect: false },
      { id: "b", text: "Nem", isCorrect: true },
    ]
  },
  {
    id: 3,
    question: "Melyik oszlopban található több labda?",
    image: third_question,
    options: [
      { id: "a", text: "Bal oldali", isCorrect: true },
      { id: "b", text: "Jobb oldali", isCorrect: false },
    ]
  },
  {
    id: 4,
    question: "Hány almát kell hozzáadni a bal oldali tálhoz, hogy a jobb oldali kép mennyiségét kapjuk?",
    image: fourth_question,
    options: [
      { id: "a", text: "4", isCorrect: false },
      { id: "b", text: "1", isCorrect: true },
      { id: "c", text: "6", isCorrect: false },
      { id: "d", text: "3", isCorrect: false }
    ]
  },
  {
    id: 5,
    question: "9-hez mennyit kell hozzáadni, hogy 18-at kapjunk?",
    image: fifth_question,
    options: [
      { id: "a", text: "5", isCorrect: false },
      { id: "b", text: "11", isCorrect: false },
      { id: "c", text: "9", isCorrect: true },
      { id: "d", text: "7", isCorrect: false }
    ]
  }
];

const FirstGrade = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); 
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
    setTimeLeft(60);
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
        setTimeLeft(60);
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
        setTimeLeft(60);
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
    setTimeLeft(60);
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
              <p>Biztos el szeretnéd indítani az első évfolyamosoknak szóló tesztet?</p>
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
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                ></div>
              </div>
              <div className="countdown">{timeLeft} másodperc</div>
            </div>
            
            <div className="question-section">
              <h3>Kérdés {currentQuestionIndex + 1} / {questions.length}</h3>
              <div className="question">{currentQuestion.question}</div>
              
              <div className="question-image">
                <img src={currentQuestion.image} alt="Kérdés illusztráció" />
              </div>
              
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
                    
                    <div className="question-image">
                      <img src={question.image} alt="Kérdés illusztráció" />
                    </div>
                    
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

export default FirstGrade;