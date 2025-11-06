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
    <header className="navbar navbar-expand navbar-dark bg-mathhero-primary shadow-sm fixed-top">
      <div className="container">
        <a className="navbar-brand fw-bold fs-4" href="#">
          MATHHERO
        </a>
        <nav className="navbar-nav ms-auto">
          <button
            className="nav-link btn btn-link text-white"
            onClick={(e) => {
              e.preventDefault();
              openAuthModal();
            }}
          >
            Bejelentkezés
          </button>
        </nav>
      </div>

      <Auth isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </header>
  );
};

export default Header;