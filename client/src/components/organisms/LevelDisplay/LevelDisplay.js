import React from "react";
import {
  calculateLevel,
  getTierForLevel,
  getTitleForLevel,
  getLevelProgress,
  getXpUntilNextLevel,
  checkMilestones,
} from "../../../utils/levelCalculator";
import "./LevelDisplay.scss";

const LevelDisplay = ({ stats }) => {
  // Calculate total XP from all categories
  const totalXp = Object.values(stats).reduce((sum, stat) => sum + stat.xp, 0);

  const currentLevel = calculateLevel(totalXp);
  const tier = getTierForLevel(currentLevel);
  const title = getTitleForLevel(currentLevel);
  const levelProgress = getLevelProgress(totalXp);
  const xpUntilNext = getXpUntilNextLevel(totalXp);
  const milestones = checkMilestones(currentLevel, stats);

  // Filter to only unique milestones (avoid duplicates)
  const uniqueMilestones = Array.from(
    new Map(milestones.map((m) => [m.id, m])).values()
  );

  const isMaxLevel = currentLevel === 50;

  return (
    <div className="level-display-container">
      <div className="level-card">
        <div className="level-header" style={{ backgroundColor: tier.color }}>
          <div className="level-number">{currentLevel}</div>
          <div className="level-meta">
            <div className="tier-name">{tier.name}</div>
            <div className="title-name">{title}</div>
          </div>
        </div>

        <div className="level-body">
          {/* Current Level XP Progress */}
          <div className="xp-section">
            <div className="xp-header">
              <span className="xp-label">Level Progress</span>
              <span className="xp-numbers">
                {levelProgress.currentLevelXp.toFixed(2)} / {levelProgress.nextLevelXp.toFixed(2)}
              </span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{
                  width: `${levelProgress.progress * 100}%`,
                  backgroundColor: tier.color,
                }}
              ></div>
            </div>
            {!isMaxLevel && (
              <p className="xp-remaining">
                {xpUntilNext.toFixed(2)} XP until next level
              </p>
            )}
            {isMaxLevel && (
              <p className="xp-remaining max-level">🎉 Maximum Level Reached!</p>
            )}
          </div>

          {/* Total XP Overview */}
          <div className="total-xp-section">
            <div className="total-xp-label">Total XP</div>
            <div className="total-xp-value">{totalXp.toFixed(2)}</div>
          </div>

          {/* Milestones */}
          {uniqueMilestones.length > 0 && (
            <div className="milestones-section">
              <h4>Achievements Unlocked</h4>
              <div className="milestones-grid">
                {uniqueMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="milestone-badge"
                    title={milestone.description}
                  >
                    <span className="milestone-icon">{milestone.icon}</span>
                    <span className="milestone-name">{milestone.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tier Information */}
      <div className="tier-info">
        <div className="tier-progression">
          <div className="tier-steps">
            <div
              className={`tier-step ${currentLevel <= 10 ? "active" : "completed"}`}
              style={{
                backgroundColor: currentLevel <= 10 ? "#8b5cf6" : "#6b7280",
              }}
            >
              <div className="step-label">Novice</div>
              <div className="step-range">1-10</div>
            </div>
            <div
              className={`tier-step ${currentLevel <= 20 && currentLevel > 10 ? "active" : currentLevel > 20 ? "completed" : ""}`}
              style={{
                backgroundColor:
                  currentLevel > 10
                    ? currentLevel <= 20
                      ? "#3b82f6"
                      : "#6b7280"
                    : "#e5e7eb",
              }}
            >
              <div className="step-label">Adept</div>
              <div className="step-range">11-20</div>
            </div>
            <div
              className={`tier-step ${currentLevel <= 30 && currentLevel > 20 ? "active" : currentLevel > 30 ? "completed" : ""}`}
              style={{
                backgroundColor:
                  currentLevel > 20
                    ? currentLevel <= 30
                      ? "#10b981"
                      : "#6b7280"
                    : "#e5e7eb",
              }}
            >
              <div className="step-label">Master</div>
              <div className="step-range">21-30</div>
            </div>
            <div
              className={`tier-step ${currentLevel <= 40 && currentLevel > 30 ? "active" : currentLevel > 40 ? "completed" : ""}`}
              style={{
                backgroundColor:
                  currentLevel > 30
                    ? currentLevel <= 40
                      ? "#f59e0b"
                      : "#6b7280"
                    : "#e5e7eb",
              }}
            >
              <div className="step-label">Legend</div>
              <div className="step-range">31-40</div>
            </div>
            <div
              className={`tier-step ${currentLevel > 40 ? "active" : ""}`}
              style={{
                backgroundColor: currentLevel > 40 ? "#ec4899" : "#e5e7eb",
              }}
            >
              <div className="step-label">Ascendant</div>
              <div className="step-range">41-50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelDisplay;

