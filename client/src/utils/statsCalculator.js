// Category definitions
export const CATEGORIES = [
  "Intelligence",
  "Fitness",
  "Creativity",
  "Health",
  "Social",
  "Productivity",
];

export const CATEGORY_COLORS = {
  Intelligence: "#6366f1",
  Fitness: "#f97316",
  Creativity: "#ec4899",
  Health: "#22c55e",
  Social: "#06b6d4",
  Productivity: "#f59e0b",
};

/**
 * Calculate stats for all categories
 * Formula: (achieved / (total goals * 365))
 * Example: 1 achievement out of 1 goal over 365 days = 1/365 = 0.27%
 * @param {Array} items - Array of items with id and name
 * @param {Object} categories - Object mapping itemId to category name
 * @param {Object} progressData - Object mapping "itemId-dateString" to boolean
 * @param {Date} referenceDate - The date to calculate stats from (optional)
 * @returns {Object} Object with category names as keys and stats as values
 */
export const calculateCategoryStats = (items, categories, progressData, referenceDate = new Date()) => {
  const stats = {};

  // Initialize all categories
  CATEGORIES.forEach((category) => {
    stats[category] = {
      total: 0,
      achieved: 0,
      percentage: 0,
      xp: 0,
    };
  });

  // Count items and achievements per category
  items.forEach((item) => {
    const category = categories[item.id] || "Intelligence"; // Default to Intelligence
    if (stats[category]) {
      stats[category].total += 1;

      // Count achieved days for this item
      const achievedDays = Object.keys(progressData).filter((key) => {
        const [itemId] = key.split("-");
        return itemId === String(item.id) && progressData[key];
      }).length;

      stats[category].achieved += achievedDays;
    }
  });

  // Calculate percentages and XP
  Object.keys(stats).forEach((category) => {
    const categoryStats = stats[category];
    if (categoryStats.total > 0) {
      // Formula: achieved / (total * 365)
      const fraction = categoryStats.achieved / (categoryStats.total * 365);
      categoryStats.percentage = fraction * 100;
      // Clamp percentage to 100
      categoryStats.percentage = Math.min(categoryStats.percentage, 100);
      // XP is the raw fraction value (0-1 range, multiply by 365 for display if desired)
      categoryStats.xp = fraction * 365;
    }
  });

  return stats;
};

/**
 * Get formatted stats for display
 * @param {Object} stats - Stats object from calculateCategoryStats
 * @returns {Array} Array of objects with category, value, and color for spider graph
 */
export const getSpiderGraphData = (stats) => {
  return CATEGORIES.map((category) => ({
    category,
    value: stats[category] ? Math.round(stats[category].percentage) : 0,
    fullValue: stats[category] ? stats[category].xp : 0,
    color: CATEGORY_COLORS[category],
  }));
};

/**
 * Get category by ID
 * @param {string|number} itemId
 * @param {Object} categories
 * @returns {string} Category name
 */
export const getCategoryForItem = (itemId, categories) => {
  return categories[itemId] || "Intelligence";
};

