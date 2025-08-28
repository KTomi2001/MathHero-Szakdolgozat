import React, { useState } from "react";
import "./Header.css";
import Auth from "../Login/Authentication.jsx";

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <header className="mathhero-header">
      <div className="container">
        <div className="row">
          <div className="col-6">
            <div className="logo">MATHHERO</div>
          </div>
          <div className="col-6 nav-container">
            <nav className="header-nav">
              <a
                href="#"
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  openAuthModal();
                }}
              >
                Bejelentkezés
              </a>
            </nav>
          </div>
        </div>
      </div>

      <Auth isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </header>
  );
};

export default Header;