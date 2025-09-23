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
          <div className="col-12">
            <div className="footer-bottom">
              <p className="text-center w-100">
                A webalkalmazás / szakdolgozat készítője Keresztes Tamás, a Dunaújvárosi Egyetem hallgatója.
              </p>
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