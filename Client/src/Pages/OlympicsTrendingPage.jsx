import React from "react";
import Header from "../Components/Header/Header";
import BottomTabs from "../Components/BottomTabs/BottomTabs";

import OlympicsTrendingNews from "../Components/OlympicsTrendingNews/OlympicsTrendingNews";
import "./OlympicsTrendingPage.scss";

import olympics from "../Images/flame.png";

const OlympicsTrendingPage = () => {
  return (
    <div className="OlympicsTrending-page">
      <Header title="Olympics 2024" image={olympics} icon="flame icon" />
      <OlympicsTrendingNews />
      <BottomTabs />
    </div>
  );
};

export default OlympicsTrendingPage;
