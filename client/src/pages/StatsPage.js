import React, { useState, useEffect, useMemo } from "react";
import "../pages/css/StatsPage.scss";
import LevelDisplay from "../components/organisms/LevelDisplay/LevelDisplay";
import SpiderGraph from "../components/organisms/SpiderGraph/SpiderGraph";
import StatsDisplay from "../components/organisms/StatsDisplay/StatsDisplay";
import {
  calculateCategoryStats,
  getSpiderGraphData,
} from "../utils/statsCalculator";

const StatsPage = () => {
  const [progressData, setProgressData] = useState({});
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("progressTrackerData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setItems(parsedData.items || []);
      setProgressData(parsedData.progressData || {});
      setCategories(parsedData.categories || {});
    }
  }, []);

  // Calculate stats using memoization
  const stats = useMemo(
    () => calculateCategoryStats(items, categories, progressData),
    [items, categories, progressData]
  );

  const spiderGraphData = useMemo(
    () => getSpiderGraphData(stats),
    [stats]
  );

  return (
    <div className="stats-page">
      <h1>Your Stats & Progression</h1>
      <p className="page-subtitle">
        Track your progress across all categories and watch your level grow!
      </p>

      <div className="stats-content">
        {/* Level Display Section */}
        <section className="stats-section level-section">
          <LevelDisplay stats={stats} />
        </section>

        {/* Spider Graph Section */}
        <section className="stats-section graph-section">
          <SpiderGraph data={spiderGraphData} />
        </section>

        {/* Detailed Stats Section */}
        <section className="stats-section details-section">
          <StatsDisplay stats={stats} />
        </section>

        {/* Quick Stats Overview */}
        <section className="stats-section overview-section">
          <h2>Quick Overview</h2>
          <div className="overview-grid">
            <div className="overview-card">
              <h3>Total Goals</h3>
              <p className="overview-value">{items.length}</p>
            </div>
            <div className="overview-card">
              <h3>Categories Active</h3>
              <p className="overview-value">{Object.keys(categories).length}</p>
            </div>
            <div className="overview-card">
              <h3>Total Days Tracked</h3>
              <p className="overview-value">
                {Object.values(progressData).filter(Boolean).length}
              </p>
            </div>
            <div className="overview-card">
              <h3>Completion Rate</h3>
              <p className="overview-value">
                {items.length > 0
                  ? Math.round(
                      (Object.values(progressData).filter(Boolean).length /
                        (items.length * 365)) *
                        100
                    ) + "%"
                  : "0%"}
              </p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="stats-section info-section">
          <h2>How It Works</h2>
          <div className="info-content">
            <div className="info-card">
              <h3>📊 XP System</h3>
              <p>
                Each category tracks your progress using the formula:
                <code>achieved / (total goals × 365)</code>
              </p>
            </div>
            <div className="info-card">
              <h3>🎮 Leveling System</h3>
              <p>
                Your total XP across all categories determines your level.
                Progress from Level 1 (Novice) to Level 50 (Ascendant) through 5 tiers!
              </p>
            </div>
            <div className="info-card">
              <h3>🎯 Milestones</h3>
              <p>
                Unlock achievements at key levels (1, 10, 25, 50) and when you reach
                50% or 100% progress in any category.
              </p>
            </div>
            <div className="info-card">
              <h3>🕷️ Spider Graph</h3>
              <p>
                Visualize your progress across all 6 categories at a glance.
                A balanced graph means well-rounded growth!
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Empty State Message */}
      {items.length === 0 && (
        <div className="empty-state">
          <h2>No Data Yet</h2>
          <p>
            Start by adding goals in the Progress Tracker to see your stats and level progression!
          </p>
          <a href="/ProgressTracker" className="btn-primary">
            Go to Progress Tracker
          </a>
        </div>
      )}
    </div>
  );
};

export default StatsPage;

