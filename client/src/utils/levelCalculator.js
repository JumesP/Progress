/**
 * Level System Calculator
 * 50-level progression with exponential XP scaling
 * Designed to reward consistency and long-term effort
 */

// Tier definitions (5 tiers, 10 levels each)
export const TIERS = {
  NOVICE: { name: "Novice", startLevel: 1, endLevel: 10, color: "#8b5cf6" },
  ADEPT: { name: "Adept", startLevel: 11, endLevel: 20, color: "#3b82f6" },
  MASTER: { name: "Master", startLevel: 21, endLevel: 30, color: "#10b981" },
  LEGEND: { name: "Legend", startLevel: 31, endLevel: 40, color: "#f59e0b" },
  ASCENDANT: { name: "Ascendant", startLevel: 41, endLevel: 50, color: "#ec4899" },
};

// Level titles for flavor (one per 5 levels)
const LEVEL_TITLES = {
  1: "Awakening",
  5: "Rising",
  10: "Ascending",
  15: "Determined",
  20: "Forged",
  25: "Resilient",
  30: "Masterful",
  35: "Legendary",
  40: "Exalted",
  45: "Transcendent",
  50: "Ascendant",
};

/**
 * Calculate the base XP requirement for a level using exponential scaling
 * Formula: baseXp * (1.15 ^ (level - 1))
 * Level 1 = 3,000 XP
 * Level 25 = ~75,000 XP
 * Level 50 = ~1,800,000 XP
 */
const calculateLevelXpRequirement = (level) => {
  const baseXp = 3000;
  const multiplier = 1.15;
  return Math.floor(baseXp * Math.pow(multiplier, level - 1));
};

/**
 * Generate all XP thresholds (cumulative)
 * Returns array where index = level, value = cumulative XP needed
 */
export const generateLevelThresholds = () => {
  const thresholds = [0]; // Level 0 = 0 XP
  let cumulativeXp = 0;

  for (let level = 1; level <= 50; level++) {
    cumulativeXp += calculateLevelXpRequirement(level);
    thresholds.push(cumulativeXp);
  }

  return thresholds;
};

// Cache the thresholds
const LEVEL_THRESHOLDS = generateLevelThresholds();

/**
 * Calculate current level based on total XP
 * @param {number} totalXp - Total XP earned across all categories
 * @returns {number} Current level (1-50)
 */
export const calculateLevel = (totalXp) => {
  for (let i = 50; i >= 1; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i]) {
      return i;
    }
  }
  return 1;
};

/**
 * Get the tier for a level
 * @param {number} level - Current level
 * @returns {Object} Tier info with name, color, etc.
 */
export const getTierForLevel = (level) => {
  if (level <= 10) return TIERS.NOVICE;
  if (level <= 20) return TIERS.ADEPT;
  if (level <= 30) return TIERS.MASTER;
  if (level <= 40) return TIERS.LEGEND;
  return TIERS.ASCENDANT;
};

/**
 * Get title for a level (every 5 levels)
 * @param {number} level - Current level
 * @returns {string} Flavor title
 */
export const getTitleForLevel = (level) => {
  // Find the highest milestone level <= current level
  for (let i = level; i >= 1; i--) {
    if (LEVEL_TITLES[i]) {
      return LEVEL_TITLES[i];
    }
  }
  return "Awakening";
};

/**
 * Get current level progress (0-1)
 * @param {number} totalXp - Total XP earned
 * @returns {Object} { currentLevel, nextLevel, currentLevelXp, nextLevelXp, progress (0-1) }
 */
export const getLevelProgress = (totalXp) => {
  const currentLevel = calculateLevel(totalXp);
  const nextLevel = currentLevel < 50 ? currentLevel + 1 : 50;

  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextLevelThreshold = LEVEL_THRESHOLDS[nextLevel];

  const currentLevelXp = totalXp - currentLevelThreshold;
  const nextLevelXp = nextLevelThreshold - currentLevelThreshold;

  const progress = nextLevelXp > 0 ? currentLevelXp / nextLevelXp : 1;

  return {
    currentLevel,
    nextLevel,
    currentLevelXp: Math.max(0, currentLevelXp),
    nextLevelXp,
    progress: Math.min(progress, 1), // Clamp to 0-1
    totalXp,
    totalXpNeeded: LEVEL_THRESHOLDS[50],
  };
};

/**
 * Get XP needed for next level
 * @param {number} totalXp - Total XP earned
 * @returns {number} XP until next level (0 if max level)
 */
export const getXpUntilNextLevel = (totalXp) => {
  const { nextLevel, nextLevelXp, currentLevelXp } = getLevelProgress(totalXp);
  if (nextLevel >= 50 && currentLevelXp >= nextLevelXp) return 0;
  return Math.max(0, nextLevelXp - currentLevelXp);
};

/**
 * Check if user has unlocked any milestones
 * Milestones at levels 1, 10, 25, 50 and specific achievements
 * @param {number} currentLevel - Current level
 * @param {Object} stats - Stats object from calculateCategoryStats
 * @returns {Array} Array of unlocked milestone objects
 */
export const checkMilestones = (currentLevel, stats) => {
  const milestones = [];

  // Level milestones
  const levelMilestones = [1, 10, 25, 50];
  levelMilestones.forEach((level) => {
    if (currentLevel >= level) {
      milestones.push({
        id: `level-${level}`,
        name: `Level ${level}`,
        description: `Reached Level ${level}`,
        icon: "⭐",
        unlockedAt: level,
        type: "level",
      });
    }
  });

  // Category perfection milestones
  if (stats) {
    Object.entries(stats).forEach(([category, data]) => {
      // 50% category progress
      if (data.percentage >= 50) {
        milestones.push({
          id: `half-${category}`,
          name: `${category} Halfway`,
          description: `50% progress in ${category}`,
          icon: "🔥",
          unlockedAt: currentLevel,
          type: "category",
          category,
        });
      }

      // 100% category progress
      if (data.percentage >= 100) {
        milestones.push({
          id: `perfect-${category}`,
          name: `${category} Master`,
          description: `100% progress in ${category}`,
          icon: "🏆",
          unlockedAt: currentLevel,
          type: "category",
          category,
        });
      }
    });
  }

  return milestones;
};

/**
 * Get all level info as an array for reference
 * @returns {Array} Array of level info objects
 */
export const getAllLevelInfo = () => {
  const levels = [];
  for (let level = 1; level <= 50; level++) {
    const tier = getTierForLevel(level);
    const title = getTitleForLevel(level);
    const xpThreshold = LEVEL_THRESHOLDS[level];

    levels.push({
      level,
      tier: tier.name,
      title,
      color: tier.color,
      xpRequired: xpThreshold,
      xpForThisLevel:
        level === 1 ? xpThreshold : xpThreshold - LEVEL_THRESHOLDS[level - 1],
    });
  }
  return levels;
};

/**
 * Get estimated days to reach a level (assuming perfect consistency)
 * Formula: If you achieve 1 goal perfectly every day, you gain (1 / 365) = 0.0027 XP per day
 * But this varies based on number of goals
 * Returns rough estimate
 */
export const estimateDaysToLevel = (targetLevel) => {
  const xpNeeded = LEVEL_THRESHOLDS[targetLevel];
  // Rough average: assume user completes ~2 goals consistently
  // That gives roughly 0.5 XP per day average
  const averageXpPerDay = 0.5;
  return Math.floor(xpNeeded / averageXpPerDay);
};

