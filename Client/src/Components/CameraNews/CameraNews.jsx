//! React imports
import React, { useState, useRef } from "react";

//! Library imports
import toast, { Toaster } from "react-hot-toast";
import Tesseract from "tesseract.js";
import Webcam from "react-webcam";
import axios from "axios";

//! URL import
import { BASE_URL } from "../config";

//! File imports
import GuidelinesBox from "../GuidelinesBox/GuidelinesBox";
import "./CameraNews.scss";

const CameraNews = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [matchingArticles, setMatchingArticles] = useState([]);
  const [manualInput, setManualInput] = useState(false);
  const [manualWords, setManualWords] = useState("");
  const [cameraWorking, setCameraWorking] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGuidelineAlert, setShowGuidelineAlert] = useState(true);
  const webcamRef = useRef(null);

  //! Capture image
  const handleCapture = async () => {
    if (showGuidelineAlert) {
      setShowGuidelineAlert(false);
      return;
    }

    const imageData = webcamRef.current.getScreenshot();
    if (imageData) {
      setLoading(true);
      setImage(imageData);

      const blob = await fetch(imageData).then((res) => res.blob());
      const {
        data: { text },
      } = await Tesseract.recognize(blob, "eng");

      const cleanedText = cleanUpText(text);
      setExtractedText(cleanedText.toLowerCase());
      setLoading(false);
      fetchMatchingArticles(cleanedText);
    }
  };

  const cleanUpText = (text) => {
    const cleanedText = text.replace(/[^\w\s]/gi, "").replace(/\n/g, " ");
    const noNumbersText = cleanedText.replace(/\b\d+\b/g, "");
    return noNumbersText.replace(/\s+/g, " ").trim();
  };

  //! Get specific keywords from news article
  function extractKeywords(text) {
    text = text.toLowerCase();

    const stopWords = [
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "for",
      "on",
      "in",
      "of",
      "with",
      "to",
      "at",
      "by",
      "from",
    ];

    const words = text.split(/\W+/);

    const filteredWords = words.filter(
      (word) => !stopWords.includes(word) && word.length >= 3
    );

    const wordFrequency = {};
    filteredWords.forEach((word) => {
      if (wordFrequency[word]) {
        wordFrequency[word]++;
      } else {
        wordFrequency[word] = 1;
      }
    });

    const sortedKeywords = Object.keys(wordFrequency).sort(
      (a, b) => wordFrequency[b] - wordFrequency[a]
    );

    return sortedKeywords.slice(0, 5);
  }

  //! Fetch matching article from captured image
  const fetchMatchingArticles = async (text) => {
    const sources = [
      "indianews", "ndtvnews", "zeenews",
      "cbsnews", "huffpost", "cnnnews", "lanews",
      "techcrunch", "lifehacker", "wired", "verge", "zdnet", "gadget360",
      "delhi", "bangalore", "mumbai", "chennai", "hyderabad", "kochi", "kolkata", "madurai", "kozhikode", "mangaluru", "puducherry", "thiruvananthapuram", "tiruchirapalli", "vijaywada", "himachalpradesh", "haryana", "jammukashmir", "punjab", "jaipur", "surat", "varanasi", "ahmedabad", "hyderabad", "guwahati", "goa", "patna", "ranchi", "kanpur", "hubli", "bhopal",
      "texas", "newyork", "mississippi", "florida", "washington", "montana", "lasvegas", "california", "nebraska", "northdakota", "denver", "southcarolina", "indiana",
      "jakarta", "bandung", "surabaya", "bali", "sumatra",
      "havana", "santiago", "pinardelrio", "matanzas",
      "london", "manchester", "birmingham", "glasgow", "wales", "scotland", "northernireland",
      "newzealand", "uk", "us", "australia", "india", "china", "russia", "argentina", "israel", "saudiarabia", "southafrica", "turkey", "srilanka", "canada", "denmark", "france", "japan", "germany", "bangladesh", "pakistan", "nepal", "myanmar", "indonesia", "brazil", "nigeria", "greenland", "mexico",
      "bbc", "guardian", "independent", "telegraph",
      "granma",
      "thehindu", "scpost", "rtworld", "guardianworld", "independentworld", "nprworld", "newsweek",
      "marketbusiness", "ibtimes", "vox", "fortune", "businessinsider",
      "espn", "fourfourtwo", "eurosport", "cbssport",
      "statnews", "kffhealth", "medpagetoday", "theconversation",
      "spacenews", "livescience", "physics", "newsscientist",
      "etonline", "billboard", "hollywoodreporter", "deadline", "variety",
      "fashionrogue", "businessofffashion", "glamour", "glaziamagazine", "coveteur",
      "euromaid", "apnews", "bbcukraine", "nytukraine",
      "apisrael", "guardianisrael", "jpost", "bbcisrael",
      "insidehigh", "theconversationeducation", "educationnext", "hechingerreport",
      "brazilnews", "brasilwire", "estadao", "braziljournal",
      "olympics"
    ];
  
    let allMatchingArticles = [];
  
    try {
      for (const source of sources) {
        const response = await axios.get(`${BASE_URL}/news/${source}`);
        const articles = response.data;
  
        const matchingArticles = articles.filter((article) => {
          const titleWords = article.title.toLowerCase().split(" ");
          const descriptionWords = article.description.toLowerCase().split(" ");
          const keywords = extractKeywords(text);
          const foundInTitle = titleWords.some((word) =>
            keywords.includes(word.toLowerCase())
          );
          const foundInDescription = descriptionWords.some((word) =>
            keywords.includes(word.toLowerCase())
          );
          return foundInTitle || foundInDescription;
        });
  
        allMatchingArticles = [...allMatchingArticles, ...matchingArticles];
      }
  
      setMatchingArticles(allMatchingArticles);
  
      if (allMatchingArticles.length > 0) {
        toast.success("Found related articles!");
      } else {
        toast.error(
          "No latest news found related to captured image or entered keyword in last 24 hours!"
        );
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };
  

  const handleManualInput = () => {
    setManualInput(true);
  };

  const handleManualInputChange = (e) => {
    const inputValue = e.target.value;
    const wordsArray = inputValue.split(/\s+/);
    const limitedWords = wordsArray.slice(0, 3).join(" ");
    setManualWords(limitedWords);
  };

  const handleManualInputSubmit = () => {
    if (manualWords) {
      fetchMatchingArticles(manualWords);
    }
    setManualInput(false);
    setManualWords("");
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === matchingArticles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const videoConstraints = {
    facingMode: "environment", 
  };

  return (
    <div className="camera-news-cont">
      {showGuidelineAlert && (
        <GuidelinesBox
          message="Guidelines for better results"
          li1="Ensure good lighting conditions."
          li2="Avoid capturing blurry images."
          li3="Keep the camera steady while capturing."
          li4="There must be text in image."
          onClose={() => setShowGuidelineAlert(false)}
        />
      )}

      {image && matchingArticles.length === 0 ? null : (
        <div className="camera-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={() => setCameraWorking(false)}
            onUserMedia={() => setCameraWorking(true)}
            className="webcam-video"
          />
          <button
            onClick={handleCapture}
            className={!cameraWorking ? "disabled-capture" : "capture-btn"}
            disabled={!cameraWorking}
          >
            {loading ? "Capturing..." : "Capture"}
          </button>
        </div>
      )}

      {matchingArticles.length > 0 && (
        <>
          {loading && <p className="browsing-artc">Browsing articles...</p>}
          <div className="article-card">
            <a
              href={matchingArticles[currentIndex].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3>
                {matchingArticles[currentIndex].title
                  .split(" ")
                  .map((word, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: extractedText.includes(
                          word.toLowerCase()
                        )
                          ? "yellow"
                          : "transparent",
                      }}
                    >
                      {word}{" "}
                    </span>
                  ))}
              </h3>
              <p className="description">
                {matchingArticles[currentIndex].description
                  .split(" ")
                  .map((word, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: extractedText.includes(
                          word.toLowerCase()
                        )
                          ? "yellow"
                          : "transparent",
                      }}
                    >
                      {word}{" "}
                    </span>
                  ))}
              </p>
            </a>
          </div>
          <button onClick={handleNext} className="next-btn">
            Next
          </button>
          {!manualInput && (
            <button onClick={handleManualInput} className="question-btn">
              Didn't get the accurate news?
            </button>
          )}
          {manualInput && (
            <div style={{ whiteSpace: "noWrap" }}>
              <input
                type="text"
                placeholder="Enter up to 3 words related to image"
                value={manualWords}
                onChange={handleManualInputChange}
                className="answer-input-btn"
              />
              <button onClick={handleManualInputSubmit} className="done-btn">
                Done
              </button>
            </div>
          )}
        </>
      )}
      <Toaster />
    </div>
  );
};

export default CameraNews;
