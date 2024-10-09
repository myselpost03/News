//! React imports
import React, { useState, useEffect, useCallback } from "react";

//! Library import
import axios from "axios";

//! Files import
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import AlertPopup from "../AlertPopup/AlertPopup";

//! Utility imports
import { renderNewsArticles } from "../../Utils/renderArticlesUtility";

//! URL imports
import { BASE_URL } from "../config";
import { LOCATION_URL } from "../location";

import "./LocalNews.scss";

function LocalNews() {
  const [animating, setAnimating] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [country, setCountry] = useState(null);
  const [combinedLocalNews, setCombinedLocalNews] = useState([]);
  const [cardsCounter, setCardsCounter] = useState(0);
  const [visibleCards, setVisibleCards] = useState(9);
  const [subscription, setSubscription] = useState(null);
  const numOfCardsPerLoad = 9;
  const decisionVal = 200;

  let pullDeltaX = 0;
  let $card, $cardReject, $cardLike;

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register(
            "/service-worker.js"
          );

          const vapidPublicKey =
            "BFYpZ9Lk5HdtTY5gx2InF-FXWMFb0sbaQgQa489op10YK9mBu4hgM-JQGh6K6Pwq8NwGn3tHMbNukgx3IWD51PY";
          const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

          const newSubscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey,
          });
          setSubscription(newSubscription);
          await axios.post(`${BASE_URL}/subscribe`, newSubscription);
        } catch (error) {
          console.error("Error subscribing to push notifications:", error);
        }
      };

      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (combinedLocalNews.length > 0) {
        const headlines = combinedLocalNews
          .slice(0, 3)
          .map((article) => article.title);
        headlines.forEach((headline) => {
          sendNotification("MySelpost", headline);
        });
      }
    }, 3600000); // 1 hour in milliseconds

    return () => clearInterval(interval);
  }, [combinedLocalNews]);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("isFirstVisit");

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

    if (!isFirstVisit) {
      fetchCountry();
    } else {
      const storedCountry = localStorage.getItem("country");
      if (storedCountry) {
        setCountry(storedCountry);
      }
    }
  }, []);

  const sendNotification = async (title, body) => {
    try {
      await axios.post(`${BASE_URL}/send-notification`, { title, body });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({});

  const fetchData = useCallback(
    async (page) => {
      try {
        setIsLoading(true);
        let responseArray;
        if (country === "IN") {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/indianews?page=${page}`),
            axios.get(`${BASE_URL}/news/ndtvnews?page=${page}`),
            axios.get(`${BASE_URL}/news/zeenews?page=${page}`),
          ]);
        } else if (country === "US") {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/cbsnews?page=${page}`),
            axios.get(`${BASE_URL}/news/huffpost?page=${page}`),
            axios.get(`${BASE_URL}/news/cnnnews?page=${page}`),
            axios.get(`${BASE_URL}/news/lanews?page=${page}`),
          ]);
        } else if (country === "UK") {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/bbc?page=${page}`),
            axios.get(`${BASE_URL}/news/guardian?page=${page}`),
            axios.get(`${BASE_URL}/news/independent?page=${page}`),
            axios.get(`${BASE_URL}/news/telegraph?page=${page}`),
          ]);
        } else if (country === "ID") {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/indonesia1?page=${page}`),
            axios.get(`${BASE_URL}/news/indonesia2?page=${page}`),
            axios.get(`${BASE_URL}/news/indonesia3?page=${page}`),
          ]);
        } else if (country === "CA") {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/canada1?page=${page}`),
            axios.get(`${BASE_URL}/news/canada2?page=${page}`),
            axios.get(`${BASE_URL}/news/canada3?page=${page}`),
          ]);
        }else if (country === "CU") {
          responseArray = await Promise.all([
            axios.get(`${BASE_URL}/news/granma?page=${page}`),
          ]);
        } else {
          setCombinedLocalNews([]);
          setIsLoading(false);
          return;
        }

        const combinedNews = responseArray.flatMap(({ data }, index) => {
          let countryName;
          if (country === "IN") {
            countryName = "India";
          } else if (country === "US") {
            countryName = "US";
          } else if (country === "UK") {
            countryName = "UK";
          } else if (country === "CU") {
            countryName = "Cuba";
          } else {
            countryName = "Unknown";
          }

          return combineNews(data, countryName);
        });

        setCombinedLocalNews(combinedNews);
        if (combinedNews.length > 0) {
          const headlines = combinedNews
            .slice(0, 3)
            .map((article) => article.title);
          headlines.forEach((headline, index) => {
            sendNotification(`MySelpost`, headline);
          });
        }
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
    if (!["IN", "UK", "US", "CU", "CA"].includes(country)) {
      setShowAlert(true);
    } else {
      setShowAlert(false);
      fetchDataOnMount();
    }
  }, [country, fetchData, currentPage]);

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

  const [factChecking, setFactChecking] = useState(false);

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

  const formatDateDifference = useCallback((date) => {
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2591260 },
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
  }, []);

  const combineNews = useCallback(
    (newsArray, source) => newsArray.map((news) => ({ ...news, source })),
    []
  );

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
              combinedLocalNews,
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
            {combinedLocalNews.length >= visibleCards && (
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
      {showAlert && (
        <AlertPopup
          message="This feature will come soon for your country!"
          onClose={handleCloseAlert}
        />
      )}
    </>
  );
}

export default LocalNews;
