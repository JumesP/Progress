import React, { useState } from "react";
import { CATEGORY_COLORS } from "../../../utils/statsCalculator";
import "./StatsDisplay.scss";

const StatsDisplay = ({ stats }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  if (!stats || Object.keys(stats).length === 0) {
    return null;
  }

  const getFractionString = (achieved, total) => {
    const denominator = total * 365;
    return `${achieved}/${denominator}`;
  };

  return (
    <div className="stats-display">
      <h3>Category Stats</h3>
      <div className="stats-grid">
        {Object.entries(stats).map(([category, data]) => (
          <div key={category} className="stat-card">
            <div
              className="stat-header"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
            >
              <span className="stat-category">{category}</span>
            </div>
            <div className="stat-body">
              <div className="stat-row">
                <span className="stat-label">Goals:</span>
                <span className="stat-value">{data.total}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Achieved:</span>
                <span className="stat-value">{data.achieved}</span>
              </div>
              <div className="stat-row highlight">
                <span className="stat-label">Progress:</span>
                <div className="progress-value-wrapper">
                  <span
                    className="stat-value progress-with-tooltip"
                    onMouseEnter={() => setHoveredCategory(category)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {data.percentage.toFixed(1)}%
                    <span className="tooltip-hint">ⓘ</span>
                  </span>
                  {hoveredCategory === category && (
                    <div className="custom-tooltip">
                      {getFractionString(data.achieved, data.total)}
                    </div>
                  )}
                </div>
              </div>
              <div className="stat-row">
                <span className="stat-label">XP:</span>
                <span className="stat-value">{Math.round(data.xp)}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${data.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[category],
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsDisplay;

