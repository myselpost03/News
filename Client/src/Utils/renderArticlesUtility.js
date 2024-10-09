import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeHigh,
  faVolumeXmark,
  //faRefresh,
} from "@fortawesome/free-solid-svg-icons";

import News from "../Images/news.png";

export const renderNewsArticles = (
  articles,
  visibleCards,
  cardsCounter,
  handleMouseDownOrTouchStart,
  handleFactCheck,
  setImagesLoaded,
  formatDateDifference,
  imagesLoaded,
  toggleSpeak,
  speakingArticle,
  speaking,
  factChecking,
  //handleRefresh
) => {
  const sortedArticles = sortArticlesByDate(articles).sort((a, b) => {
    if (a.image && !b.image) return -1;
    if (!a.image && b.image) return 1;
    return 0;
  });

  return sortedArticles
    .slice(cardsCounter, cardsCounter + visibleCards)
    .map((article, index) => (
      <div
        key={index}
        className={`news__card ${index < cardsCounter ? "below" : ""}`}
        onMouseDown={handleMouseDownOrTouchStart}
        onTouchStart={handleMouseDownOrTouchStart}
      >
        <div
          className={`news__card__top ${index % 2 === 0 ? "brown" : "lime"}`}
        >
          <div className="news__card__img">
            <img
              src={imagesLoaded[article.title] ? article.image || News : News}
              alt="image related to article"
              className="article-img"
              onLoad={() => {
                setImagesLoaded((prev) => ({
                  ...prev,
                  [article.title]: true,
                }));
              }}
            />
          </div>
        </div>
        <div className="news__card__btm">
          <h3 className="news__card__we">{article.title}</h3>
          <p
            className={
              article.description.length > 120
                ? "news__card__we__big"
                : "news__card__we"
            }
          >
            {article.description.length > 170
              ? `${article.description.substring(0, 170)}...`
              : article.description}
          </p>
          <div className="link-fact-date-cont">
            <div className="link-fact-cont">
              <Link
                to={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="link-to-source"
              >
                Read More
              </Link>
              <button
                onClick={() => handleFactCheck(article)}
                className={`fact-btn ${
                  article.isFactual === undefined || article.isFactual === null
                    ? ""
                    : article.isFactual
                    ? "fact-btn-green"
                    : "fact-btn-red"
                }`}
              >
                {factChecking
                  ? "Checking..."
                  : article.isFactual === undefined ||
                    article.isFactual === null
                  ? "Fact Check"
                  : article.isFactual
                  ? "Factual"
                  : "Not Factual"}
              </button>
              <FontAwesomeIcon
                icon={
                  speakingArticle === article.description
                    ? faVolumeHigh
                    : faVolumeXmark
                }
                onClick={() => toggleSpeak(article.description)}
                className="speaker"
              />
              {/*<FontAwesomeIcon
                icon={faRefresh}
                onClick={handleRefresh}
                className="speaker"
              />*/}
            </div>
            <p className="news_card_date">
              <strong>{article.source}</strong>.{" "}
              {formatDateDifference(article.date)}
            </p>
          </div>
        </div>
        <div className="news__card__choice m--reject"></div>
        <div className="news__card__choice m--like"></div>
        <div className="news__card__drag"></div>
      </div>
    ));
};

const sortArticlesByDate = (articles) => {
  return articles.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
};
