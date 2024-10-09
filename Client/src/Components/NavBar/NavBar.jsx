import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../../Images/trending-logo.png";
import "./NavBar.scss";

const NavBar = () => {
  const location = useLocation();
  

  
  return (
    <nav className="desktop-navbar">
      <div className="desktop-logo">
        <img src={Logo} alt="platform logo" />
        
        <h1 className="brand-name">
          MySelpost</h1>
      </div>
      <div className="desktop-tabs">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/features">Features</Link>
          </li>
          <li>
            <Link to="/contact-us">Contact Us</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
