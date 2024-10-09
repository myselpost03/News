import React, { useState } from "react";
import { Link } from "react-router-dom";

import Fashion from "../../Images/lifestyle.png";
import Technology from "../../Images/technology.png";
import Business from "../../Images/business.png";
import Entertainment from "../../Images/entertainment.png";
import Sports from "../../Images/sports.png";
import Science from "../../Images/science.png";
import Health from "../../Images/health.png";
import Book from "../../Images/book.png";
import flame from "../../Images/flame.png";

import "./Menu.scss";

const Menu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <div className={`menu ${isMenuOpen ? "open" : ""}`}>
        {/* <div className="menu-trending-item">
          <Link to="/olympics-trending" className="menu-olympics-trending-link" onClick={() => handleLinkClick('Second Trending')}>
           <img src={flame} className="flame" alt="flame in orange-yellow colors" /> Olympics 2024
          </Link>
        </div>*/}
        <div className="menu-trending-item">
          <Link to="/second-trending" className="menu-trending-item1-link">
            #Israel-Hamas
          </Link>
        </div>
        <div className="menu-trending-item">
          <Link to="/first-trending" className="menu-trending-item2-link">
            #Russia-Ukraine
          </Link>
        </div>

        <div className="menu-item">
          <img src={Technology} alt="violet and tomato colored chipset" />
          <Link to="/technology" className="menu-item-link">
            Technology
          </Link>
        </div>
        <div className="menu-item">
          <img src={Business} alt="office bag in light red color" />
          <Link to="/business" className="menu-item-link">
            Business
          </Link>
        </div>
        <div className="menu-item">
          <img src={Sports} alt="football" />
          <Link to="/sports" className="menu-item-link">
            Sports
          </Link>
        </div>
        <div className="menu-item">
          <img src={Health} alt="heart with addition icon" />
          <Link to="/health" className="menu-item-link">
            Health
          </Link>
        </div>
        <div className="menu-item">
          <img src={Science} alt="dna strand in light red" />
          <Link to="/science" className="menu-item-link">
            Science
          </Link>
        </div>
        <div className="menu-item">
          <img src={Entertainment} alt="Shooting video camera" />
          <Link to="/entertainment" className="menu-item-link">
            Entertainment
          </Link>
        </div>
        <div className="menu-item">
          <img src={Fashion} alt="cartoonish accessories bag" />
          <Link to="/fashion" className="menu-item-link">
            Fashion
          </Link>
        </div>
        <div className="menu-item">
          <img src={Book} alt="three cartoonish books queue horizontally" />
          <Link to="/education" className="menu-item-link">
            Education
          </Link>
        </div>
      </div>
      <div className="hamburger-menu" onClick={toggleMenu}>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
        <div className={`bar ${isMenuOpen ? "open" : ""}`}></div>
      </div>
    </div>
  );
};

export default Menu;
