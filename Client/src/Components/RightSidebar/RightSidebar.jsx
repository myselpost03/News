import React from "react";
import MapsPage from "../../Pages/MapsPage";
import "./RightSidebar.scss";

const RightSidebar = () => {
  return (
    <div className="right-sidebar">
      <div className="d-bubble-container">
        <div className="d-bubble"></div>
      </div>
      <button className="d-bubble-btn">Bubble News</button>
      <div className="d-maps-page">
      <MapsPage />
      </div>
    </div>
  );
};

export default RightSidebar;
