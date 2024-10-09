import React, { useState, useEffect, useCallback } from "react";

import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";

import axios from "axios";

import { renderNewsArticles } from "../../Utils/renderArticlesUtility";

import { BASE_URL } from "../config";
import { LOCATION_URL } from "../location";

import "../LocalNews/LocalNews";

const TechnologyNews = () => {
  const [animating, setAnimating] = useState(false);
  const [factChecking, setFactChecking] = useState(false);
  const [country, setCountry] = useState(null);

  const [cardsCounter, setCardsCounter] = useState(0);
  const [visibleCards, setVisibleCards] = useState(9);

  const numOfCardsPerLoad = 9;
  const decisionVal = 200;

  let pullDeltaX = 0;
  let $card, $cardReject, $cardLike;

  //! Fetch user country
  useEffect(() => {
    const isFirstVisit = localStorage.getItem("isFirstVisit");

    if (!isFirstVisit) {
      const fetchCountry = async () => {
        try {
          const response = await axios.get(`${LOCATION_URL}`);
          const { country } = response.data;
          localStorage.setItem("country", country);
          setCountry(country);
          localStorage.setItem("isFirstVisit", false);
        } catch (error) {
          console.error("Error fetching country:", error);
        }
      };

      fetchCountry();
    } else {
      const storedCountry = localStorage.getItem("country");
      if (storedCountry) {
        setCountry(storedCountry);
      }
    }
  }, []);

  const [combinedTechNews, setCombinedTechNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});

  //! Fetch news data
  const fetchData = useCallback(
    async (page) => {
      try {
        setIsLoading(true);
        let responseArray;
        if (country) {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/techcrunch?page=${page}`),
            axios.get(`${BASE_URL}/news/lifehacker?page=${page}`),
            axios.get(`${BASE_URL}/news/wired?page=${page}`),
            axios.get(`${BASE_URL}/news/verge?page=${page}`),
            axios.get(`${BASE_URL}/news/zdnet?page=${page}`),
            axios.get(`${BASE_URL}/news/gadget360?page=${page}`),
          ]);
        } else {
          setCombinedTechNews([]);
          setIsLoading(false);
          return;
        }

        const combinedNews = responseArray.flatMap(({ data }, index) => {
          let countryName;
          if (country) {
            countryName = "Tech";
          } else {
            countryName = "Tech";
          }

          return combineNews(data, countryName);
        });

        setCombinedTechNews(combinedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [country]
  );

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => {
      const newPage = prevPage + 1;
      fetchData(newPage);
      return newPage;
    });
  };

  useEffect(() => {
    const fetchDataOnMount = async () => {
      await fetchData(currentPage);
    };

    fetchDataOnMount();
  }, [fetchData, currentPage]);

  function pullChange() {
    if (!$card || !$cardReject || !$cardLike) return;

    setAnimating(true);
    const deg = pullDeltaX / 10;
    $card.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`;

    const opacity = pullDeltaX / 100;
    $cardReject.style.opacity = opacity >= 0 ? 0 : Math.abs(opacity);
    $cardLike.style.opacity = opacity <= 0 ? 0 : opacity;
  }

  function release() {
    const direction = pullDeltaX >= 0 ? "to-right" : "to-left";
    $card.classList.add(direction);

    if (Math.abs(pullDeltaX) >= decisionVal) {
      $card.classList.add("inactive");

      setTimeout(() => {
        $card.classList.add("below");
        $card.classList.remove("inactive", "to-left", "to-right");
        setCardsCounter(cardsCounter + 1);
        if (cardsCounter === numOfCardsPerLoad) {
          setCardsCounter(0);
          document
            .querySelectorAll(".demo__card")
            .forEach((card) => card.classList.remove("below"));
        }
      }, 300);
    } else {
      $card.classList.add("reset");
    }

    setTimeout(() => {
      $card.removeAttribute("style");
      $card.classList.remove("reset");
      $card
        .querySelectorAll(".demo__card__choice")
        .forEach((choice) => choice.removeAttribute("style"));

      pullDeltaX = 0;
      setAnimating(false);
    }, 300);
  }

  function handleMouseDownOrTouchStart(e) {
    if (animating) return;

    $card = e.currentTarget;
    $cardReject = $card.querySelector(".demo__card__choice.m--reject");
    $cardLike = $card.querySelector(".demo__card__choice.m--like");
    const startX = e.pageX || e.touches[0].pageX;

    function handleMouseMoveOrTouchMove(e) {
      const x = e.pageX || e.touches[0].pageX;
      pullDeltaX = x - startX;
      if (!pullDeltaX) return;
      pullChange();
    }

    function handleMouseUpOrTouchEnd() {
      document.removeEventListener("mousemove", handleMouseMoveOrTouchMove);
      document.removeEventListener("mouseup", handleMouseUpOrTouchEnd);
      document.removeEventListener("touchmove", handleMouseMoveOrTouchMove);
      document.removeEventListener("touchend", handleMouseUpOrTouchEnd);
      if (!pullDeltaX) return;
      release();
    }

    document.addEventListener("mousemove", handleMouseMoveOrTouchMove);
    document.addEventListener("mouseup", handleMouseUpOrTouchEnd);
    document.addEventListener("touchmove", handleMouseMoveOrTouchMove);
    document.addEventListener("touchend", handleMouseUpOrTouchEnd);
  }

  
  const checkFactualClaims = async (article) => {
    setFactChecking(true);

    try {
      const api_key = "307425e154ff424b9a6fd2e9513ec503";
      const response = await axios.get(
        `https://idir.uta.edu/claimbuster/api/v2/score/text/${article.description}`,
        {
          headers: {
            "x-api-key": api_key,
          },
        }
      );

      const isFactual = response.data.results[0].score > 0.1;

      article.isFactual = isFactual;

      setFactChecking(false);
      //console.log(response.data)
    } catch (error) {
      console.error("Error checking factual claims:", error);
      setFactChecking(false);
    }
  };

  const handleFactCheck = (newsArticle) => {
    checkFactualClaims(newsArticle);
  };

  //! Format date in readable format
  const formatDateDifference = (date) => {
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];

    const currentDate = new Date();
    const difference = Math.floor((currentDate - new Date(date)) / 1000);

    for (const { label, seconds } of intervals) {
      const value = Math.floor(difference / seconds);
      if (value >= 1) {
        return `${value} ${label}${value !== 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  };

  const combineNews = (newsArray, source) =>
    newsArray.map((news) => ({ ...news, source }));

  const [speaking, setSpeaking] = useState(false);
  const [speakingArticle, setSpeakingArticle] = useState(null);

  const toggleSpeak = (description) => {
    if (speaking) {
      stopSpeaking();
    } else {
      speakArticleDescription(description);
      setSpeakingArticle(description);
    }
  };

  const speakArticleDescription = (description) => {
    const utterance = new SpeechSynthesisUtterance(description);
    utterance.addEventListener("end", () => {
      setSpeaking(false);
      setSpeakingArticle(null);
    });
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setSpeakingArticle(null);
  };

  return (
    <>
      <div className="news__card-cont">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {renderNewsArticles(
              combinedTechNews,
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
              factChecking
            )}
            {combinedTechNews.length > visibleCards && (
              <button
                className="load-more-btn"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default TechnologyNews;
