import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import "./DashboardMain.css";
import { auth, db } from "../../firebase";
import { doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const Dashboard = ({ username, onLogout }) => {
  const [testCount, setTestCount] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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

        console.log("Felhasználói adatok betöltve:", stats);
        
        await updateUserStreak(userDocRef, stats);
      } else {
        console.log("A felhasználó nem található!");
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
      console.log("Nincs korábbi bejelentkezési adat, mai dátum beállítása");
      await updateDoc(userDocRef, {
        "stats.lastLogin": today
      });
      return;
    }
    
    lastLogin.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - lastLogin.getTime();
    const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    console.log("Mai dátum:", today.toISOString());
    console.log("Utolsó belépés:", lastLogin.toISOString());
    console.log("Nap különbség:", dayDiff);
    
    try {
      if (dayDiff === 1) {
        const newStreak = (stats.streak || 0) + 1;
        console.log("Streak növelése:", newStreak);
        await updateDoc(userDocRef, {
          "stats.streak": newStreak,
          "stats.lastLogin": today,
          "stats.loginToday": true
        });
        setStreak(newStreak);
      } else if (dayDiff > 1) {
        console.log("Streak visszaállítása 1-re (több mint 1 nap telt el)");
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
          console.log("Mai első bejelentkezés, streak növelése");
          const newStreak = (stats.streak || 0) + 1;
          await updateDoc(userDocRef, {
            "stats.streak": newStreak,
            "stats.lastLogin": now,
            "stats.loginToday": true
          });
          setStreak(newStreak);
        } else {
          console.log("Mai ismételt bejelentkezés, lastLogin frissítése");
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

  const setupMidnightReset = () => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    setTimeout(async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, {
            "stats.loginToday": false
          });
          console.log("loginToday flag resetelve éjfélkor");
        }
        setupMidnightReset();
      } catch (error) {
        console.error("Hiba a loginToday reset során:", error);
      }
    }, timeUntilMidnight);
  };

  useEffect(() => {
    document.body.classList.add("dashboard-page");
    setupMidnightReset();
    
    return () => {
      document.body.classList.remove("dashboard-page");
    };
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchLeaderboard();
  }, []);

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

        <hr className="menu-divider" />

        <div className="menu-items">
          <div className="menu-item active" onClick={handleUserClick}>
            <span className="icon">👤</span>
            <span>Felhasználó</span>
          </div>
          <div className="menu-item" onClick={() => navigate("/practice")}>
            <span className="icon">⭐</span>
            <span>Gyakorlás</span>
          </div>
        </div>

        <div className="menu-items bottom-menu">
          <hr className="menu-divider" />
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
        <div className="greeting">
          <h2>Üdvözöllek, {username || "(USER)"}!</h2>
        </div>

        <div className="cards-container">
          <div className="card test-card">
            <div className="card-icon">📋</div>
            <h3>Eddig <span className="test-count">{testCount}</span> tesztet végeztél el. Így tovább!</h3>
          </div>

          <div className="card answers-card">
            <div className="card-icon">📊</div>
            <div className="answers-icons">
              <div className="icon-container">
                <div className="icon-check">✓</div>
                <span className="answer-count">{correctAnswers}</span>
              </div>
              <div className="icon-container">
                <div className="icon-x">✗</div>
                <span className="answer-count">{incorrectAnswers}</span>
              </div>
            </div>
            <h3>Helyes és helytelen válaszok</h3>
          </div>

          <div className="card streak-card">
            <div className="card-icon">🔥</div>
            <h3>Eddig <span className="streak-count">{streak}</span> napon keresztül jelentkeztél be egyhuzamban</h3>
          </div>

          <div className="card leaderboard-card">
            <div className="card-icon">🏆</div>
            <h3>Ranglista</h3>
            <ul className="leaderboard-list">
              {leaderboard.length > 0 ? (
                leaderboard.map((item, index) => (
                  <React.Fragment key={index}>
                    <li>
                      {index === 0 && <span className="medal gold">🥇</span>}
                      {index === 1 && <span className="medal silver">🥈</span>}
                      {index === 2 && <span className="medal bronze">🥉</span>}
                      {item.user} - <span className="score-highlight">{item.score}</span> helyes válasz
                    </li>
                    {(index === 0 || index === 1) && <hr className="leaderboard-divider" />}
                  </React.Fragment>
                ))
              ) : (
                <li>Nincs még elég adat a ranglistához</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;