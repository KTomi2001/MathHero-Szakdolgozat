import React, { useState } from "react";
import "./JoinUs.css";
import king from "../../assets/MainPage/king.svg";
import Authentication from "../Login/Authentication";

const JoinUs = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleOpenAuth = () => {
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <section className="join-section bg-light py-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-7 order-2 order-md-1 text-center text-md-start">
            <h2 className="display-5 fw-bold text-primary mb-3">
              Csatlakozz hozzánk!
            </h2>
            <p className="fs-5 text-muted mb-4">
              Fejleszd a matektudásodat és légy a MathHero bajnoka! Regisztrálj
              most, és kezdd el a gyakorlást!
            </p>
            <button
              className="btn btn-lg rounded-pill register-btn"
              onClick={handleOpenAuth}
            >
              Regisztrálj
            </button>
          </div>
          <div className="col-md-5 order-1 order-md-2 text-center">
            <img
              src={king}
              alt="Math King"
              className="img-fluid king-image"
            />
          </div>
        </div>
      </div>

      <Authentication
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        initialAuthMode="register"
      />
    </section>
  );
};

export default JoinUs;