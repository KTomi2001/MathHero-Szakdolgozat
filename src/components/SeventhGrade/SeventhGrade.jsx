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
        { id: "c", text: <InlineMath math={"-\\frac{32}{24}"} />, isCorrect: false }, 
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

const Sidebar = ({ onLogout, sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  return (
    <>
      <div
        className={`bg-dark text-white ${sidebarOpen ? '' : 'd-none d-lg-flex'}`}
        style={{
          width: '250px',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1050,
          flexDirection: 'column'
        }}
      >
        <div className="text-center py-4">
          <img src={cat} alt="MathHero" style={{ width: '65px', height: '65px' }} />
          <h5 className="mt-2 mb-0">MATHHERO</h5>
        </div>
        <hr className="border-secondary mx-3" />
        <div className="flex-grow-1">
          <div
            className="d-flex align-items-center gap-3 px-3 py-2 mx-2 rounded text-white-50"
            style={{ cursor: 'pointer' }}
            onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: '20px' }}>👤</span>
            <span>Felhasználó</span>
          </div>
          <div
            className="d-flex align-items-center gap-3 px-3 py-2 mx-2 mt-2 rounded bg-secondary bg-opacity-25 text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => { navigate("/practice"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span>Gyakorlás</span>
          </div>
        </div>
        <div className="mt-auto">
          <hr className="border-secondary mx-3" />
          <div
            className="d-flex align-items-center gap-3 px-3 py-2 mx-2 rounded text-white-50"
            style={{ cursor: 'pointer' }}
            onClick={() => { navigate("/settings"); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: '20px' }}>⚙️</span>
            <span>Beállítások</span>
          </div>
          <div
            className="d-flex align-items-center gap-3 px-3 py-2 mx-2 mt-2 mb-3 rounded text-white-50"
            style={{ cursor: 'pointer' }}
            onClick={onLogout}
          >
            <span style={{ fontSize: '20px' }}>🚪</span>
            <span>Kijelentkezés</span>
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="d-lg-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1040
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
};

const SeventhGrade = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 180 mp
  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(null));

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
    
    let classes = "p-3 border rounded-3";
    
    if (optionId === userAnswerId) {
      classes += isCorrect ? " border-success bg-success-subtle fw-bold" : " border-danger bg-danger-subtle fw-bold";
    } 
    else if (isCorrect) {
      classes += " border-success bg-success-subtle";
    }
    else {
      classes += " bg-light";
    }
    return classes;
  };

  let mainContentClass = "flex-grow-1 d-flex";
  let mainContentStyle = {
    overflowY: 'auto',
    backgroundColor: '#f3f4f6' 
  };

  if (!testActive && !testFinished) {
    mainContentClass += " desktop-content align-items-center justify-content-center";
  } else {
    mainContentClass += " flex-column align-items-center py-5 px-3";
    mainContentStyle.backgroundColor = '#f8f9fa'; 
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {!testActive && !testFinished && (
        <>
          <Sidebar 
            onLogout={handleLogout} 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <div className="d-lg-none">
            <button 
              className="btn btn-primary rounded-circle m-3"
              style={{ width: '50px', height: '50px', position: 'fixed', zIndex: 1060 }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
          </div>
        </>
      )}

      <div className={mainContentClass} style={mainContentStyle}>
        
        {showConfirmation && (
          <div 
            className="modal" 
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} 
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content shadow-lg p-4 rounded-3 text-center">
                <div className="modal-body">
                  <h3 className="mb-3">Teszt indítása</h3>
                  <p className="fs-5 mb-4">Biztos el szeretnéd indítani a hetedik évfolyamosoknak szóló tesztet?</p>
                  <div className="d-flex justify-content-center gap-3">
                    <button className="btn btn-success btn-lg" onClick={startTest}>Igen</button>
                    <button className="btn btn-danger btn-lg" onClick={cancelTest}>Nem</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {testActive && (
          <div className="card test-card-container shadow-lg p-3 p-sm-4 p-md-5 rounded-3 w-100" style={{ maxWidth: '800px' }}>
            <div className="card-body">
              <div className="mb-4">
                <div className="progress" style={{ height: '10px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar"
                    style={{ width: `${(timeLeft / 180) * 100}%` }}
                    aria-valuenow={timeLeft}
                    aria-valuemin="0"
                    aria-valuemax="180"
                  ></div>
                </div>
                <div className="text-center fs-5 fw-bold my-3">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="question-section">
                <h3 className="h5 text-muted text-center">Kérdés {currentQuestionIndex + 1} / {questions.length}</h3>
                <h2 className="h3 text-center mb-4">{currentQuestion.question}</h2>
                
                {currentQuestion.image && (
                  <div className="text-center mb-4">
                    <img 
                      src={currentQuestion.image} 
                      alt="Kérdés illusztráció" 
                      className="img-fluid rounded-3"
                      style={{ maxHeight: '250px', border: '1px solid #ddd' }}
                    />
                  </div>
                )}
                
                <div className="row g-3">
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className="col-12 col-md-6">
                      <button 
                        className="btn btn-outline-primary btn-lg w-100 p-3"
                        onClick={() => handleAnswerClick(option.isCorrect, option.id)}
                      >
                        {option.text}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {testFinished && (
          <div className="card test-card-container shadow-lg p-3 p-sm-4 p-md-5 rounded-3 w-100 text-center" style={{ maxWidth: '800px' }}>
            <div className="card-body">
              <h2 className="mb-4">Teszt befejezve!</h2>
              <div className="mb-4">
                <p className="fs-4 mb-2">Helyes válaszok: <span className="text-success fw-bold">{correctAnswers}</span></p>
                <p className="fs-4">Helytelen válaszok: <span className="text-danger fw-bold">{incorrectAnswers}</span></p>
              </div>
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
                <button className="btn btn-primary btn-lg" onClick={restartTest}>Teszt újraindítása</button>
                <button className="btn btn-secondary btn-lg" onClick={goToDashboard}>Vissza a kezdőlapra</button>
              </div>
              
              <hr className="my-4" />
              
              <div className="detailed-results text-start mt-4">
                <h3 className="text-center mb-3">Részletes eredmények</h3>
                <p className="text-center text-muted fst-italic mb-4">Görgess lejjebb a részletes elemzésért</p>
                
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[index];
                  const userSelectedOption = userAnswer !== "timeout" 
                    ? question.options.find(opt => opt.id === userAnswer) 
                    : null;
                  
                  return (
                    <div key={index} className="mb-5">
                      <h4 className="mb-3">Kérdés {index + 1}</h4>
                      <div className="fs-5 fw-bold d-block mb-3">
                        {userAnswer === null && (
                          <span className="text-muted">Nem válaszoltál erre a kérdésre</span>
                        )}
                        {userAnswer === "timeout" && (
                          <span className="text-warning">Lejárt az idő</span>
                        )}
                        {userAnswer !== null && userAnswer !== "timeout" && (
                          <span className={userSelectedOption?.isCorrect ? "text-success" : "text-danger"}>
                            {userSelectedOption?.isCorrect ? "Helyes válasz" : "Helytelen válasz"}
                          </span>
                        )}
                      </div>
                      
                      <div className="fs-5 mb-3">{question.question}</div>
                      
                      {question.image && (
                        <div className="text-center mb-3">
                          <img src={question.image} alt="Kérdés illusztráció" className="img-fluid rounded-3" style={{ maxHeight: '200px' }} />
                        </div>
                      )}

                      <div className="row g-3">
                        {question.options.map((option) => (
                          <div key={option.id} className="col-12 col-md-6 position-relative">
                            <div className={getOptionStyle(question, option.id)}>
                              {option.text}
                              {option.isCorrect && 
                                <span className="position-absolute top-0 end-0 p-2 fs-4 text-success">✓</span>
                              }
                              {!option.isCorrect && userAnswer === option.id && 
                                <span className="position-absolute top-0 end-0 p-2 fs-4 text-danger">✗</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                      <hr className="mt-5" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 992px) {
          .desktop-content {
            margin-left: 250px !important;
          }
        }
        @media (max-width: 991.98px) {
          .desktop-content {
            margin-left: 0 !important;
          }
          .desktop-content > .modal {
             padding-top: 80px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SeventhGrade;