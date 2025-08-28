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
    <section className="join-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-7">
            <h2 className="section-title">Csatlakozz hozzánk!</h2>
            <p className="join-text">
              Fejleszd a matektudásodat és légy a MathHero bajnoka! Regisztrálj
              most, és kezdd el a gyakorlást!
            </p>
            <button className="register-btn" onClick={handleOpenAuth}>Regisztrálj</button>
          </div>
          <div className="col-md-5 text-center">
            <img src={king} alt="Math King" className="king-image" />
          </div>
        </div>
      </div>
      
      <Authentication 
        isOpen={isAuthOpen} 
        onClose={handleCloseAuth} 
      />
    </section>
  );
};

export default JoinUs;