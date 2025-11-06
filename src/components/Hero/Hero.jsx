import React from "react";
import "./Hero.css";
import cat from "../../assets/MainPage/cat.svg";

const Hero = () => {
  return (
    <section className="hero-section d-flex align-items-center bg-white">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 order-2 order-md-1 text-center text-md-start">
            <h1 className="display-4 fw-bold text-primary mb-3">
              Sosem volt könnyebb!
            </h1>
            <p className="fs-5 text-muted mb-4">
              A MathHero egy izgalmas, interaktív gyakorló platform általános
              iskolások számára, amely segít fejleszteni a matematikai
              készségeket játékos formában. Válaszd ki az évfolyamodat, és
              oldj meg kihívást jelentő feladatokat időre!
            </p>
          </div>
          <div className="col-md-6 order-1 order-md-2 text-center">
            <img src={cat} alt="MathHero Logo" className="img-fluid hero-image" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;