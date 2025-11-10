import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import "./DashboardMain.css";

const Dashboard = ({ username, onLogout }) => {
  const [testCount, setTestCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserClick = () => {
    window.location.reload();
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

  const fetchUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const stats = userData.stats || {};

        setTestCount(stats.testCount || 0);
        setCorrectAnswers(stats.correctAnswers || 0);
        setIncorrectAnswers(stats.incorrectAnswers || 0);
        setStreak(stats.streak || 1);
        
        await updateUserStreak(userDocRef, stats);
      }
    } catch (error) {
      console.error("Hiba a felhasználói adatok lekérésekor:", error);
    }
  };

  const updateUserStreak = async (userDocRef, stats) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLogin = stats.lastLogin ? new Date(stats.lastLogin.toDate()) : null;
    if (!lastLogin) {
      await updateDoc(userDocRef, {
        "stats.lastLogin": today
      });
      return;
    }
    
    lastLogin.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - lastLogin.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    try {
      if (dayDiff === 1) {
        const newStreak = (stats.streak || 0) + 1;
        await updateDoc(userDocRef, {
          "stats.streak": newStreak,
          "stats.lastLogin": today,
          "stats.loginToday": true
        });
        setStreak(newStreak);
      } else if (dayDiff > 1) {
        await updateDoc(userDocRef, {
          "stats.streak": 1,
          "stats.lastLogin": today,
          "stats.loginToday": true
        });
        setStreak(1);
      } else if (dayDiff === 0) {
        const now = new Date();
        const midnightToday = new Date();
        midnightToday.setHours(0, 0, 0, 0);
        
        const lastLoginWithTime = stats.lastLogin.toDate();
        const lastLoginDay = new Date(lastLoginWithTime);
        lastLoginDay.setHours(0, 0, 0, 0);
        
        if (!stats.loginToday && lastLoginDay.getTime() < midnightToday.getTime()) {
          const newStreak = (stats.streak || 0) + 1;
          await updateDoc(userDocRef, {
            "stats.streak": newStreak,
            "stats.lastLogin": now,
            "stats.loginToday": true
          });
          setStreak(newStreak);
        } else {
          await updateDoc(userDocRef, {
            "stats.lastLogin": now
          });
        }
      }
    } catch (error) {
      console.error("Hiba a streak frissítésekor:", error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const leaderboardQuery = query(
        collection(db, "users"),
        orderBy("stats.correctAnswers", "desc"),
        limit(3)
      );
      
      const querySnapshot = await getDocs(leaderboardQuery);
      const leaderboardData = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        leaderboardData.push({
          user: userData.username,
          score: userData.stats?.correctAnswers || 0
        });
      });
      
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error("Hiba a ranglista lekérésekor:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchLeaderboard();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
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
            className="d-flex align-items-center gap-3 px-3 py-2 mx-2 rounded bg-secondary bg-opacity-25 text-white"
            style={{ cursor: 'pointer' }}
            onClick={() => { handleUserClick(); setSidebarOpen(false); }}
          >
            <span style={{ fontSize: '20px' }}>👤</span>
            <span>Felhasználó</span>
          </div>
          
          <div 
            className="d-flex align-items-center gap-3 px-3 py-2 mx-2 mt-2 rounded text-white-50"
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
            onClick={handleLogout}
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

      <div className="flex-grow-1 d-flex flex-column justify-content-center desktop-content">
        <div className="d-lg-none">
          <button 
            className="btn btn-primary rounded-circle m-3"
            style={{ width: '50px', height: '50px', position: 'fixed', zIndex: 1060 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <div className="container" style={{ paddingLeft: '0', paddingRight: '0' }}>
          <div className="mb-4 text-center" style={{ paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px' }}>
            <h2 className="display-5 fw-bold text-dark">Üdvözöllek, {username || "(USER)"}!</h2>
          </div>

          <div className="row g-4 justify-content-center" style={{ paddingLeft: '20px', paddingRight: '20px', paddingBottom: '20px' }}>
            
            <div className="col-12 col-md-6 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-3">
                  <div 
                    className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ width: '60px', height: '60px', backgroundColor: '#eef2ff', color: '#4f46e5', fontSize: '24px' }}
                  >
                    📋
                  </div>
                  <h6 className="card-title mb-0">
                    Eddig <span className="text-primary fw-bold">{testCount}</span> tesztet végeztél el. Így tovább!
                  </h6>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div 
                    className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ width: '60px', height: '60px', backgroundColor: '#ecfdf5', color: '#10b981', fontSize: '24px' }}
                  >
                    📊
                  </div>
                  <div className="d-flex justify-content-center gap-4 my-2">
                    <div>
                      <div 
                        className="rounded-3 d-flex align-items-center justify-content-center mb-1"
                        style={{ width: '40px', height: '40px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '18px', fontWeight: '700' }}
                      >
                        ✓
                      </div>
                      <div className="text-primary fw-bold fs-5">{correctAnswers}</div>
                    </div>
                    <div>
                      <div 
                        className="rounded-3 d-flex align-items-center justify-content-center mb-1"
                        style={{ width: '40px', height: '40px', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '18px', fontWeight: '700' }}
                      >
                        ✗
                      </div>
                      <div className="text-primary fw-bold fs-5">{incorrectAnswers}</div>
                    </div>
                  </div>
                  <p className="card-text text-muted small mb-0">Helyes és helytelen válaszok</p>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center p-3">
                  <div 
                    className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ width: '60px', height: '60px', backgroundColor: '#fffbeb', color: '#f59e0b', fontSize: '24px' }}
                  >
                    🔥
                  </div>
                  <h6 className="card-title mb-0">
                    Eddig <span className="text-primary fw-bold">{streak}</span> napon keresztül jelentkeztél be egyhuzamban
                  </h6>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center p-3">
                  <div 
                    className="rounded-3 d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ width: '60px', height: '60px', backgroundColor: '#f5f3ff', color: '#8b5cf6', fontSize: '24px' }}
                  >
                    🏆
                  </div>
                  <h6 className="card-title mb-2">Ranglista</h6>
                  <ul className="list-unstyled mb-0">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((item, index) => (
                        <li key={index} className="py-1 small">
                          {index === 0 && <span className="me-1" style={{ fontSize: '18px' }}>🥇</span>}
                          {index === 1 && <span className="me-1" style={{ fontSize: '18px' }}>🥈</span>}
                          {index === 2 && <span className="me-1" style={{ fontSize: '18px' }}>🥉</span>}
                          {item.user} - <span className="text-primary fw-bold">{item.score}</span> helyes válasz
                        </li>
                      ))
                    ) : (
                      <li className="small">Nincs még elég adat a ranglistához</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          
          .desktop-content > div:first-child {
            padding-top: 80px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;