import React from "react";
import "./Features.css";
import FeatureCard from "./FeatureCard";
import hero from "../../assets/MainPage/hero.svg";

const Features = () => {
  const features = [
    {
      icon: "heart",
      title: "Játékos Tanulás",
      bgColor: "#FFF9DB",
    },
    {
      icon: "person",
      title: "Személyre szabott feladatok",
      bgColor: "#FFF9DB",
    },
    {
      icon: "graph-up",
      title: "Fejlődés nyomon követése",
      bgColor: "#FFF9DB",
    },
    {
      icon: "box",
      title: "Ingyenes és egyszerű",
      bgColor: "#FFF9DB",
    },
  ];

  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title text-center">Miért csatlakozz?</h2>

        <div className="row">
          <div className="col-md-5 text-center">
            <img
              src={hero}
              alt="Math Hero Character"
              className="feature-hero-image"
            />
          </div>

          <div className="col-md-7">
            <div className="row feature-cards-container">
              {features.map((feature, index) => (
                <div className="col-md-6 mb-4" key={index}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    bgColor={feature.bgColor}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
