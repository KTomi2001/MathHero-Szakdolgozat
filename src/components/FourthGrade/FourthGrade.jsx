import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import first_question from "../../assets/math/fourth/first_question.png";
import second_question from "../../assets/math/fourth/second_question.png";
import third_question from "../../assets/math/fourth/third_question.png";
import fourth_question from "../../assets/math/fourth/fourth_question.png";
import fifth_question from "../../assets/math/fourth/fifth_question.png";
import "./FourthGrade.css";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";

const questions = [
  {
    id: 1,
    question: "Mi lesz a műveletsor végeredménye?",
    image: first_question,
    options: [
      { id: "a", text: "8500", isCorrect: false },
      { id: "b", text: "9400", isCorrect: true },
      { id: "c", text: "12324", isCorrect: false },
      { id: "d", text: "4000", isCorrect: false }
    ]
  },
  {
    id: 2,
    question: "Mi lesz a számítás végeredménye?",
    image: second_question,
    options: [
      { id: "a", text: "126", isCorrect: true },
      { id: "b", text: "300", isCorrect: false },
      { id: "c", text: "96", isCorrect: false },
      { id: "d", text: "156", isCorrect: false }
    ]
  },
  {
    id: 3,
    question: "Mi lesz az osztás végeredménye?",
    image: third_question,
    options: [
      { id: "a", text: "6", isCorrect: false },
      { id: "b", text: "10", isCorrect: false },
      { id: "c", text: "1", isCorrect: true },
      { id: "d", text: "3", isCorrect: false }
    ]
  },
  {
    id: 4,
    question: "A megfelelő műveleti sorrendet követve mennyi lesz a végeredmény?",
    image: fourth_question,
    options: [
      { id: "a", text: "100", isCorrect: false },
      { id: "b", text: "2521", isCorrect: false },
      { id: "c", text: "316", isCorrect: true },
      { id: "d", text: "1210", isCorrect: false }
    ]
  },
  {
    id: 5,
    question: "Állítsd csökkenő sorrendbe az alábbi állatokat méretük szerint!",
    image: fifth_question,
    type: "sorting",
    items: [
      { id: "Tigris", value: "Tigris", position: 1 },
      { id: "Gepárd", value: "Gepárd", position: 2 },
      { id: "Oroszlán", value: "Oroszlán", position: 3 },
      { id: "Vadmacska", value: "Vadmacska", position: 4 },
      { id: "Hiúz", value: "Hiúz", position: 5 }
    ],
    correctOrder: ["Tigris", "Oroszlán", "Gepárd", "Hiúz", "Vadmacska"]
  }
];

const FourthGrade = ({ username, onLogout }) => {
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
  const [sortedItems, setSortedItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  
  useEffect(() => {
    if (currentQuestionIndex === 4 && testActive) {
      const shuffledItems = [...questions[4].items].sort(() => Math.random() - 0.5);
      setAvailableItems(shuffledItems);
      setSortedItems(Array(questions[4].items.length).fill(null));
    }
  }, [currentQuestionIndex, testActive]);

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

  const handleDragStart = (e, item, index, fromAvailable = true) => {
    dragItem.current = { item, index, fromAvailable };
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e, position) => {
    e.preventDefault();
    dragOverItem.current = position;
    e.target.classList.add('highlight');
  };

  const handleDragLeave = (e) => {
    e.target.classList.remove('highlight');
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    e.target.classList.remove('highlight');
    
    if (!dragItem.current) return;
    
    const { item, index, fromAvailable } = dragItem.current;
    
    const newSortedItems = [...sortedItems];
    const newAvailableItems = [...availableItems];
    
    if (fromAvailable) {
      newAvailableItems.splice(index, 1);
      
      if (newSortedItems[slotIndex] !== null) {
        newAvailableItems.push(newSortedItems[slotIndex]);
      }
      
      newSortedItems[slotIndex] = item;
    } 
    else {

      const sourceItem = newSortedItems[index];
      
      if (newSortedItems[slotIndex] !== null) {
        newSortedItems[index] = newSortedItems[slotIndex];
      } else {
        newSortedItems[index] = null;
      }
      
      newSortedItems[slotIndex] = sourceItem;
    }
    
    setSortedItems(newSortedItems);
    setAvailableItems(newAvailableItems);
  };

  const handleSubmitOrder = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    if (sortedItems.includes(null)) {
      alert("Kérlek, helyezd el az összes értéket a sorrendben!");
      return;
    }

    try {
      const currentOrder = sortedItems.map(item => item.id);
      
      const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(questions[4].correctOrder);
      
      const newUserAnswers = [...userAnswers];
      newUserAnswers[currentQuestionIndex] = {
        order: currentOrder,
        isCorrect
      };
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

      await updateDoc(userDocRef, {
        "stats.testCount": increment(1)
      });
      setTestActive(false);
      setTestFinished(true);
    } catch (error) {
      console.error("Hiba a válasz rögzítésekor:", error);
    }
  };

  const handleRemoveFromSorted = (index) => {
    const newSortedItems = [...sortedItems];
    if (newSortedItems[index] !== null) {
      const item = newSortedItems[index];
      newSortedItems[index] = null;
      setAvailableItems([...availableItems, item]);
      setSortedItems(newSortedItems);
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
      
      if (currentQuestionIndex === 4) {
        newUserAnswers[currentQuestionIndex] = {
          order: [],
          isCorrect: false,
          timeout: true
        };
      } else {
        newUserAnswers[currentQuestionIndex] = "timeout";
      }
      
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
    
    if (question.type === "sorting") {
      return "";
    }
    
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
              <p>Biztos el szeretnéd indítani a negyedik évfolyamosoknak szóló tesztet?</p>
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
              <div className="countdown">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
            </div>
            
            <div className="question-section">
              <h3>Kérdés {currentQuestionIndex + 1} / {questions.length}</h3>
              <div className="question">{currentQuestion.question}</div>
              
              <div className="question-image">
                <img src={currentQuestion.image} alt="Kérdés illusztráció" />
              </div>
              
              {currentQuestion.type !== "sorting" && (
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
              )}
              
              {currentQuestion.type === "sorting" && (
                <div className="sorting-container">
                  <div className="sorting-instructions">
                    Húzd az állatok neveit méretük szerint csökkenő sorrendbe. 
                  </div>
                  
                  <div className="sorting-items-container">
                    {availableItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="sorting-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, index)}
                        onDragEnd={handleDragEnd}
                      >
                        {item.value}
                      </div>
                    ))}
                  </div>
                  
                  <div className="sorting-slots">
                    {sortedItems.map((item, index) => (
                      <div
                        key={`slot-${index}`}
                        className="sorting-slot"
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        <div className="sorting-slot-number">{index + 1}</div>
                        {item && (
                          <div 
                            className="sorting-item-in-slot"
                            draggable
                            onDragStart={(e) => handleDragStart(e, item, index, false)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleRemoveFromSorted(index)}
                          >
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="submit-order-button"
                    onClick={handleSubmitOrder}
                    disabled={sortedItems.includes(null)}
                  >
                    Rendezés megerősítése
                  </button>
                </div>
              )}
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
                
                if (question.type === "sorting") {
                  return (
                    <div key={index} className="question-result">
                      <h4>Kérdés {index + 1}</h4>
                      <div className="question-status">
                        {userAnswer === null && (
                          <span className="no-answer">Nem válaszoltál erre a kérdésre</span>
                        )}
                        {userAnswer && userAnswer.timeout && (
                          <span className="timeout">Lejárt az idő</span>
                        )}
                        {userAnswer && !userAnswer.timeout && (
                          <span className={userAnswer.isCorrect ? "correct" : "incorrect"}>
                            {userAnswer.isCorrect ? "Helyes válasz" : "Helytelen válasz"}
                          </span>
                        )}
                      </div>
                      
                      <div className="question-text">{question.question}</div>
                      
                      <div className="question-image">
                        <img src={question.image} alt="Kérdés illusztráció" />
                      </div>
                      
                      {userAnswer && !userAnswer.timeout && (
                        <div className="sorting-result-container">
                          <h4>A te rendezésed:</h4>
                          <div className="sorting-result-row">
                            {userAnswer.order.map((itemId, idx) => {
                              const item = question.items.find(i => i.id === itemId);
                              const correctPosition = question.correctOrder.indexOf(itemId);
                              const isCorrectPosition = correctPosition === idx;
                              
                              return (
                                <div key={idx} className="sorting-result-item">
                                  <div className="sorting-result-position">{idx + 1}. hely</div>
                                  <div className={`sorting-result-value ${isCorrectPosition ? 'correct-position' : 'incorrect-position'}`}>
                                    {item ? item.value : '?'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <h4>Helyes sorrend:</h4>
                          <div className="sorting-result-row">
                            {question.correctOrder.map((itemId, idx) => {
                              const item = question.items.find(i => i.id === itemId);
                              return (
                                <div key={idx} className="sorting-result-item">
                                  <div className="sorting-result-position">{idx + 1}. hely</div>
                                  <div className="sorting-result-value correct-position">
                                    {item ? item.value : '?'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                
                else {
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
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FourthGrade;