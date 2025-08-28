import React from "react";
import "./FeatureCard.css";

const FeatureCard = ({ icon, title, bgColor }) => {
  return (
    <div className="feature-card" style={{ backgroundColor: bgColor }}>
      <div className="feature-icon">
        <i className={`bi bi-${icon}`}></i>
      </div>
      <div className="feature-title">{title}</div>
    </div>
  );
};

export default FeatureCard;
