import React, { useState } from "react";
import { Link } from "react-router-dom";
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
    <footer className="mathhero-footer bg-dark text-white-50 py-4">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center">
            <p className="small mb-0">
              A webalkalmazás / szakdolgozat készítője Keresztes Tamás, a
              Dunaújvárosi Egyetem hallgatója.
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