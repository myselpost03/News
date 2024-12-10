import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTrendUp } from "@fortawesome/free-solid-svg-icons";
import games from "../../Images/games.jpg";
import "./LeftSidebar.scss";

const LeftSidebar = () => {
  return (
    <div className="left-sidebar">
      <div className="d-card-cont">
        <div className="d-card">
          <img src={games} alt="Games" className="d-card-image" />
        </div>
        <h2 className="d-caption">OUR FAMILY</h2>
      </div>
      <div className="d-trending-btns-cont">
        <div className="d-trending-item-1-and-icon-cont">
          <button className="d-trending-item-1" style={{ display: "flex" }}>
            #Trending{" "}
            <FontAwesomeIcon
              icon={faArrowTrendUp}
              className="d-trend-up-icon"
            />
          </button>
        </div>
        <div className="d-trending-item-2-and-icon-cont">
          <button className="d-trending-item-2" style={{ display: "flex" }}>
            #Trending{" "}
            <FontAwesomeIcon
              icon={faArrowTrendUp}
              className="d-trend-up-icon"
            />
          </button>
        </div>
        <div className="d-trending-item-3-and-icon-cont">
          <button className="d-trending-item-3" style={{ display: "flex" }}>
            #Trending{" "}
            <FontAwesomeIcon
              icon={faArrowTrendUp}
              className="d-trend-up-icon"
            />
          </button>
        </div>
        <div className="d-feedback-btn-cont">
          <button className="d-feedback-btn">Leave Your Feedback</button>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;
