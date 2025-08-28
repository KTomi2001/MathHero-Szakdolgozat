import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import "./DashboardPractice.css";

const DashboardPractice = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleGradeClick = (grade) => {
    console.log(`Kiválasztott évfolyam: ${grade}`);
    navigate(`/practice/${grade}`);
  };

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

  const grades = [
    "Első évfolyam",
    "Második évfolyam",
    "Harmadik évfolyam",
    "Negyedik évfolyam",
    "Ötödik évfolyam",
    "Hatodik évfolyam",
    "Hetedik évfolyam",
    "Nyolcadik évfolyam",
  ];

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
          <div className="menu-item" onClick={() => navigate("/dashboard")}>
            <span className="icon">👤</span>
            <span>Felhasználó</span>
          </div>
          <div className="menu-item active" onClick={() => navigate("/practice")}>
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
          <p>Válaszd ki a jelenlegi évfolyamodat és kezd el a gyakorlást!</p>
        </div>

        <div className="grades-container">
          {grades.map((grade, index) => (
            <div
              key={index}
              className="grade-card"
              onClick={() => handleGradeClick(grade)}
            >
              <div className="grade-icon">{index + 1}</div>
              <h3>{grade}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPractice;