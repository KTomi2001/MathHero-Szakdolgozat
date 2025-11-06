import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import "./DashboardPractice.css";

const DashboardPractice = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGradeClick = (grade) => {
    console.log(`Kiválasztott évfolyam: ${grade}`);
    navigate(`/practice/${grade}`);
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

        <div className="container">
          <div className="mb-4 text-center" style={{ paddingTop: '20px' }}>
            <h2 className="display-5 fw-bold text-dark">Üdvözöllek, {username || "(USER)"}!</h2>
            <p className="text-muted fs-5">Válaszd ki a jelenlegi évfolyamodat és kezd el a gyakorlást!</p>
          </div>

          <div className="row g-4 justify-content-center" style={{ paddingBottom: '20px' }}>
            {grades.map((grade, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-4">
                <div 
                  className="card border-0 shadow-sm h-100"
                  style={{ cursor: 'pointer', transition: 'transform 0.3s' }}
                  onClick={() => handleGradeClick(grade)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div className="card-body text-center p-4 ">
                    <div 
                      className="rounded-3 d-inline-flex align-items-center justify-content-center mb-3 fw-bold"
                      style={{ 
                        width: '70px', 
                        height: '70px', 
                        backgroundColor: '#eef2ff', 
                        color: '#4f46e5', 
                        fontSize: '28px' 
                      }}
                    >
                      {index + 1}
                    </div>
                    <h5 className="card-title mb-0">{grade}</h5>
                  </div>
                </div>
              </div>
            ))}
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

export default DashboardPractice;