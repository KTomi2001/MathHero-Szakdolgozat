import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import Authentication from "../Login/Authentication";

const Footer = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsAuthOpen(true);
  };

  const handleOpenRegister = () => {
    setAuthMode("register");
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <footer className="mathhero-footer">
      <div className="container">
        <div className="row footer-sections">
          <div className="col-md-4">
            <div className="footer-logo">
              <span>MATHHERO</span>
            </div>
            <p className="footer-tagline">Sosem volt könnyebb!</p>
          </div>
          <div className="col-md-2">
            <h5 className="footer-title">Oldalak</h5>
            <ul className="footer-links">
              <li>
                <Link to="/">Főoldal</Link>
              </li>
              <li>
                <a href="#" onClick={handleOpenRegister}>Regisztráció</a>
              </li>
              <li>
                <a href="#" onClick={handleOpenLogin}>Bejelentkezés</a>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5 className="footer-title">Funkciók</h5>
            <ul className="footer-links">
              <li>
                <a>Játékos feladatok</a>
              </li>
              <li>
                <a>Személyre szabott feladatok</a>
              </li>
              <li>
                <a>Fejlődés nyomon követése</a>
              </li>
              <li>
                <a>Ranglista</a>
              </li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5 className="footer-title">Kapcsolat</h5>
            <ul className="footer-links">
              <li>
                <a href="mailto:info@mathhero.hu">info@mathhero.hu</a>
              </li>
              <li>+36 12 345 6789</li>
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="footer-bottom">
              <p className="text-center w-100">
                A webalkalmazás / szakdolgozat készítője Keresztes Tamás, a Dunaújvárosi Egyetem hallgatója.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Authentication 
        isOpen={isAuthOpen} 
        onClose={handleCloseAuth}
        initialAuthMode={authMode}
      />
    </footer>
  );
};

export default Footer;