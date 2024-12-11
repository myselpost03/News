import React, { useState } from "react";
import games from "../../Images/games.jpg";
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  TwitterIcon,
} from "react-share";
import "./DesktopNewsTimer.scss";

const DesktopNewsTimer = () => {
  const [selectedCustomOption, setSelectedCustomOption] = useState("World");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);

    if (diffYears > 0)
      return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
    if (diffMonths > 0)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffHours > 0)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffMinutes > 0)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    return `${diffSeconds} second${diffSeconds > 1 ? "s" : ""} ago`;
  };
  return (
    <div className="d-news-timer">
      <div className="d-news-timer-card">
        <p className="d-news-timer-paragraph">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. 
        </p>
        <div className="d-news-timer-option-share-btn-cont">
          <div className="d-news-timer-article-img-container">
            <img src={games} alt="games" />
          </div>
          <div className="d-select">
            <select
              value={selectedCustomOption}
              onChange={(e) => setSelectedCustomOption(e.target.value)}
            >
              <option value="world">World</option>
              <option value="india">India</option>
              <option value="america">America</option>
              <option value="uk">UK</option>
              <option value="cuba">Cuba</option>
              <option value="indonesia">Indonesia</option>
              <option value="brazil">Brazil</option>
              <option value="ph">Phillipines</option>
            </select>
          </div>
          <div className="d-share-buttons">
            <FacebookShareButton
              url={"https://www.myselpost.com"}
              quote={
                "Your news, your way. Swipe, read, discover with MySelpost!"
              }
              hashtag="#myselpost"
            >
              <FacebookIcon size={28} round />
            </FacebookShareButton>
            <WhatsappShareButton
              url={"https://www.myselpost.com"}
              quote={
                "Your news, your way. Swipe, read, discover with MySelpost!"
              }
              hashtag="#myselpost"
            >
              <WhatsappIcon size={28} style={{ marginLeft: "18%" }} round />
            </WhatsappShareButton>
            <TwitterShareButton
              url={"https://www.myselpost.com"}
              quote={
                "Your news, your way. Swipe, read, discover with MySelpost!"
              }
              hashtag="#myselpost"
            >
              <TwitterIcon size={28} style={{ marginLeft: "29%" }} round />
            </TwitterShareButton>
          </div>
        </div>
        <span className="d-timer-card-date">2 days ago</span>
      </div>
      <div className="d-news-timer-btns">
        <button className="d-read-in-btn">Read News In</button>
        <button className="d-duration">1 min</button>
        <button className="d-duration">3 min</button>
        <button className="d-duration">10 min</button>
      </div>
    </div>
  );
};

export default DesktopNewsTimer;
