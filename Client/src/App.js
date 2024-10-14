import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import HomePage from "./Pages/HomePage";
import DesktopHomePage from "./Pages/DesktopHomePage";
import SplashPage from "./Pages/SplashPage";
import MapsPage from "./Pages/MapsPage";
import NewsTimerPage from "./Pages/NewsTimerPage";
import WorldNewsPage from "./Pages/WorldNewsPage";
import CameraNewsPage from "./Pages/CameraNewsPage";
import OlympicsTrendingPage from "./Pages/OlympicsTrendingPage";
import FirstTrendingPage from "./Pages/FirstTrendingPage";
import SecondTrendingPage from "./Pages/SecondTrendingPage";
import TechnologyPage from "./Pages/TechnologyPage";
import BusinessPage from "./Pages/BusinessPage";
import SportsPage from "./Pages/SportsPage";
import HealthPage from "./Pages/HealthPage";
import SciencePage from "./Pages/SciencePage";
import EntertainmentPage from "./Pages/EntertainmentPage";
import FashionPage from "./Pages/FashionPage";
import EducationPage from "./Pages/EducationPage";
import FeedbackPage from "./Pages/FeedbackPage";
import ContactUsPage from "./Pages/ContactUsPage";
import FeaturesPage from "./Pages/FeaturesPage";
import NotFoundPage from "./Pages/NotFoundPage";
import Practice from "./Components/Practice";
import axios from "axios";
import { BASE_URL } from "./Components/config";

const SplashScreen = () => {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 10000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  const handleLoading = useCallback(() => {
    setLoading(false);
  }, []);

  // Function to check if it's desktop
  const isDesktop = !isMobile;

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

  /*const sendNotification = async (title, body) => {
    try {
      await axios.post(`${BASE_URL}/send-notification`, { title, body });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  useEffect(() => {
    sendNotification(`MySelpost`, 'You got some news!');
  }, [])*/

  return (
    <div>
      {loading ? (
        <SplashPage setLoading={handleLoading} />
      ) : (
        <Router>
          <div>
            <Routes>
              {/* Only allow these routes on desktop */}
              {isDesktop ? (
                <>
                  <Route path="/" element={<DesktopHomePage />} />
                  <Route path="/contact-us" element={<ContactUsPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/world-news" element={<WorldNewsPage />} />
                  <Route path="/camera-news" element={<CameraNewsPage />} />
                  <Route path="/news-timer" element={<NewsTimerPage />} />
                  <Route path="/maps-news" element={<MapsPage />} />
                  <Route
                    path="/olympics-trending"
                    element={<OlympicsTrendingPage />}
                  />
                  <Route
                    path="/first-trending"
                    element={<FirstTrendingPage />}
                  />
                  <Route
                    path="/second-trending"
                    element={<SecondTrendingPage />}
                  />
                  <Route path="/technology" element={<TechnologyPage />} />
                  <Route path="/business" element={<BusinessPage />} />
                  <Route path="/sports" element={<SportsPage />} />
                  <Route path="/health" element={<HealthPage />} />
                  <Route path="/science" element={<SciencePage />} />
                  <Route
                    path="/entertainment"
                    element={<EntertainmentPage />}
                  />
                  <Route path="/fashion" element={<FashionPage />} />
                  <Route path="/education" element={<EducationPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/practice" element={<Practice />} />
                  <Route path="*" element={<NotFoundPage />} />
                </>
              )}
            </Routes>
          </div>
        </Router>
      )}
    </div>
  );
};

const App = () => {
  return <SplashScreen />;
};

export default App;
