import React from "react";
import "./Hero.css";
import cat from "../../assets/MainPage/cat.svg";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="hero-content">
              <h1>Sosem volt könnyebb!</h1>
              <p>
                A MathHero egy izgalmas, interaktív gyakorló platform általános
                iskolások számára, amely segít fejleszteni a matematikai
                készségeket játékos formában. Válaszd ki az évfolyamodat, és
                oldj meg kihívást jelentő feladatokat időre!
              </p>
            </div>
          </div>
          <div className="col-md-6 text-center">
            <div className="hero-logo">
              <img src={cat} alt="MathHero Logo" className="hero-image" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;