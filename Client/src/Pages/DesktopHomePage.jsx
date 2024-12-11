import React, { useEffect } from "react";
import QRCode from "qrcode.react";
import Navbar from "../Components/NavBar/NavBar";
import LeftSidebar from "../Components/LeftSidebar/LeftSidebar";
import CenterArea from "../Components/CenterArea/CenterArea";
import RightSidebar from "../Components/RightSidebar/RightSidebar";
import "./DesktopHomePage.scss";

const DesktopHomePage = () => {
  const pwaUrl = "https://myselpost.com";

  useEffect(() => {
    // Listen for beforeinstallprompt event to show the install popup
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      window.deferredPrompt = event;
      document.getElementById("install-popup").style.display = "block";
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const installApp = () => {
    const installPopup = document.getElementById("install-popup");
    installPopup.style.display = "none";
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      window.deferredPrompt.userChoice.then(function (choiceResult) {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        window.deferredPrompt = null;
      });
    }
  };

  const cancelInstall = () => {
    const installPopup = document.getElementById("install-popup");
    installPopup.style.display = "none";
    window.deferredPrompt = null;
  };

  const handleQRCodeClick = () => {
    // Display install prompt if available
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
    } else {
      // If install prompt is not available, navigate to PWA URL
      window.location.href = pwaUrl;
    }
  };

  return (
    <div className="desktop-home-page">
      <div className="navbar">
        <Navbar />
      </div>
      <div className="main-content">
        <div className="left-sidebar-content">
          <LeftSidebar />
        </div>
        <div className="center-area-content">
          <CenterArea />
        </div>
        <div className="right-sidebar-content">
          <RightSidebar />
        </div>
      </div>

      {/* Install Popup 
      <div id="install-popup" style={{ display: "none" }}>
        <div id="install-popup-content">
          <button id="install-button" onClick={installApp}>
            Install
          </button>
          <button id="cancel-button" onClick={cancelInstall}>
            Cancel
          </button>
        </div>
      </div>*/}

     
    </div>
  );
};

export default DesktopHomePage;
