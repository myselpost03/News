import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import Logo from "../../Images/logo.png";
import "./NavBar.scss";

const NavBar = () => {
  const handleInputChange = () => {};

  const handleSearch = () => {};

  return (
    <nav className="desktop-navbar">
      <div className="title-and-logo">
        <img src={Logo} alt="newspaper themed logo" className="desktop-logo" />
        <h2 className="desktop-title">MySelpost</h2>
      </div>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search MySelpost..."
          onChange={handleInputChange}
          className="search-bar"
        />
        <FontAwesomeIcon icon={faSearch} className="desktop-search-icon" />
      </div>
      <div className="desktop-nav-btns" style={{ zIndex: "1" }}>
        <button className="desktop-settings-btn">Signup</button>
        <button className="desktop-login-btn">Login</button>
      </div>
    </nav>
  );
};

export default NavBar;
