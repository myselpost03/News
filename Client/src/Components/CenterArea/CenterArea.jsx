import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import LocalNews from "../LocalNews/LocalNews";
import WorldNews from "../WorldNews/WorldNews";
import NewsTimer from "../NewsTimer/NewsTimer";
import TechnologyNews from "../TechnologyNews/TechnologyNews";
import BusinessNews from "../BusinessNews/BusinessNews";
import FashionNews from "../FashionNews/FashionNews";
import EducationNews from "../EducationNews/EducationNews";
import SportsNews from "../SportsNews/SportsNews";
import HealthNews from "../HealthNews/HealthNews";
import ScienceNews from "../ScienceNews/ScienceNews";
import EntertainmentNews from "../EntertainmentNews/EntertainmentNews";
import "./CenterArea.scss";

const CenterArea = () => {
  const [currentTab, setCurrentTab] = useState("local");
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const menuItems = [
    { name: "Technology", className: "d-technology", tab: "technology" },
    { name: "Business", className: "d-business", tab: "business" },
    {
      name: "Entertainment",
      className: "d-entertainment",
      tab: "entertainment",
    },
    { name: "Sports", className: "d-sports", tab: "sports" },
    { name: "Health", className: "d-health", tab: "health" },
    { name: "Science", className: "d-science", tab: "science" },
    { name: "Fashion", className: "d-fashion", tab: "fashion" },
    { name: "Education", className: "d-education", tab: "education" },
  ];
  const maxVisibleItems = 7;

  const handleScrollNext = () => {
    if (visibleStartIndex < menuItems.length - maxVisibleItems) {
      setVisibleStartIndex(visibleStartIndex + 1);
    }
  };

  const handleScrollPrevious = () => {
    if (visibleStartIndex > 0) {
      setVisibleStartIndex(visibleStartIndex - 1);
    }
  };

  return (
    <div className="d-center-area">
      <div className="d-tabs">
        <button
          className={`d-home-tab ${currentTab === "local" ? "active" : ""}`}
          onClick={() => setCurrentTab("local")}
        >
          Home
        </button>
        <button
          className={`d-world-tab ${currentTab === "world" ? "active" : ""}`}
          onClick={() => setCurrentTab("world")}
        >
          World
        </button>
        <button
          className={`d-news-timer-tab ${
            currentTab === "newsTimer" ? "active" : ""
          }`}
          onClick={() => setCurrentTab("newsTimer")}
        >
          News Timer
        </button>
      </div>
      <div className="d-news-card-area">
        {currentTab === "local" && <LocalNews />}
        {currentTab === "world" && <WorldNews />}
        {/* Placeholder for News Timer */}
        {currentTab === "newsTimer" && <NewsTimer />}
        {currentTab === "technology" && <TechnologyNews />}
        {currentTab === "business" && <BusinessNews />}
        {currentTab === "fashion" && <FashionNews />}
        {currentTab === "entertainment" && <EntertainmentNews />}
        {currentTab === "education" && <EducationNews />}
        {currentTab === "sports" && <SportsNews />}
        {currentTab === "health" && <HealthNews />}
        {currentTab === "science" && <ScienceNews />}
      </div>
      <div className="d-menu-container">
        <div className="d-category-icon-cont">
          <h3 className="d-category">Category</h3>
          <FontAwesomeIcon icon={faBars} className="d-menu-icon" />
        </div>
        <div className="d-menu-items">
          {visibleStartIndex > 0 && (
            <button onClick={handleScrollPrevious} className="d-scroll-arrow">
              <FontAwesomeIcon icon={faArrowUp} className="d-arrow-up" />
            </button>
          )}
          {menuItems
            .slice(visibleStartIndex, visibleStartIndex + maxVisibleItems)
            .map((item, index) => (
              <Link
                key={index}
                onClick={() => setCurrentTab(item.tab)}
                className={item.className}
              >
                {item.name}
              </Link>
            ))}
          {visibleStartIndex + maxVisibleItems < menuItems.length && (
            <button onClick={handleScrollNext} className="d-scroll-arrow">
              <FontAwesomeIcon icon={faArrowDown} className="d-arrow-down" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CenterArea;
