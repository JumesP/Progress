import React, { useState, useEffect } from "react";
import "../pages/css/ProgressTracker.scss";
import {
  CATEGORIES,
} from "../utils/statsCalculator";

const ProgressTracker = () => {
  const [items, setItems] = useState([]);
  const [newItemInput, setNewItemInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]); // Default to first category
  const [progressData, setProgressData] = useState({});
  const [categories, setCategories] = useState({}); // Maps item ID to category
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = January

  // Get dates for a specific month in 2026
  const getDatesForMonth = (month) => {
    const dates = [];
    const daysInMonth = new Date(2026, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(2026, month, day));
    }
    return dates;
  };

  const [datesForMonth, setDatesForMonth] = useState(getDatesForMonth(0));

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Update dates when month changes
  useEffect(() => {
    setDatesForMonth(getDatesForMonth(selectedMonth));
  }, [selectedMonth]);

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

  const addItem = () => {
    if (newItemInput.trim()) {
      const newItem = {
        id: Date.now(),
        name: newItemInput,
      };
      const updatedItems = [...items, newItem];
      const updatedCategories = {
        ...categories,
        [newItem.id]: selectedCategory,
      };
      setItems(updatedItems);
      setCategories(updatedCategories);
      setNewItemInput("");
      // Save immediately to localStorage
      localStorage.setItem(
        "progressTrackerData",
        JSON.stringify({
          items: updatedItems,
          progressData,
          categories: updatedCategories
        })
      );
    }
  };

  const removeItem = (id) => {
    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    const newProgressData = { ...progressData };
    Object.keys(newProgressData).forEach((key) => {
      if (key.startsWith(`${id}-`)) {
        delete newProgressData[key];
      }
    });
    setProgressData(newProgressData);
    const updatedCategories = { ...categories };
    delete updatedCategories[id];
    setCategories(updatedCategories);
    // Save immediately to localStorage
    localStorage.setItem(
      "progressTrackerData",
      JSON.stringify({
        items: updatedItems,
        progressData: newProgressData,
        categories: updatedCategories
      })
    );
  };

  const toggleProgress = (itemId, dateString) => {
    const key = `${itemId}-${dateString}`;
    const newProgressData = { ...progressData };
    newProgressData[key] = !newProgressData[key];
    setProgressData(newProgressData);
    // Save immediately to localStorage
    localStorage.setItem(
      "progressTrackerData",
      JSON.stringify({
        items,
        progressData: newProgressData,
        categories
      })
    );
  };

  const isChecked = (itemId, dateString) => {
    return progressData[`${itemId}-${dateString}`] || false;
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  // Export data to JSON file
  const exportData = () => {
    const dataToExport = {
      items,
      progressData,
      categories,
      exportDate: new Date().toISOString(),
    };

    const dataString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `progress-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import data from JSON file
  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result);

        if (
          importedData.items &&
          importedData.progressData &&
          importedData.categories
        ) {
          setItems(importedData.items);
          setProgressData(importedData.progressData);
          setCategories(importedData.categories);
          alert(
            "✅ Data imported successfully! Your goals and progress have been restored."
          );
        } else {
          alert(
            "❌ Invalid backup file. Please make sure you're importing a valid Progress Tracker backup."
          );
        }
      } catch (error) {
        alert("❌ Error reading file. Please make sure it's a valid JSON file.");
        console.error(error);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="progress-tracker">
      <h1>Progress Tracker 2026</h1>

      <div className="month-selector">
        <label htmlFor="month-dropdown">Select Month:</label>
        <select
          id="month-dropdown"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="month-dropdown"
        >
          {monthNames.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Backup Section */}
      <div className="backup-section">
        <button className="btn-backup" onClick={exportData}>
          💾 Export Backup
        </button>
        <label className="btn-backup btn-import">
          📥 Import Backup
          <input
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div className="add-item-section">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
          title="Select category for this goal"
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newItemInput}
          onChange={(e) => setNewItemInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addItem()}
          placeholder="Enter a new item..."
          className="item-input"
        />
        <button onClick={addItem} className="btn-add-item">
          Add Item
        </button>
      </div>

      <div className="tracker-container">
        <div className="tracker-wrapper">
          {/* Items column */}
          <div className="items-column">
            <div className="items-header">Items</div>
            {items.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-name">{item.name}</div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="btn-remove"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Dates and checkboxes */}
          <div className="dates-container">
            <div className="dates-header">
              {datesForMonth.map((date, index) => (
                <div
                  key={index}
                  className={`date-cell ${isToday(date) ? "today" : ""}`}
                >
                  {formatDateDisplay(date)}
                </div>
              ))}
            </div>

            {items.map((item) => (
              <div key={item.id} className="progress-row">
                {datesForMonth.map((date, index) => (
                  <div
                    key={index}
                    className={`checkbox-cell ${isToday(date) ? "today" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked(item.id, formatDate(date))}
                      onChange={() =>
                        toggleProgress(item.id, formatDate(date))
                      }
                      className="progress-checkbox"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-link-section">
        <p>View your detailed stats, level progression, and achievements:</p>
        <a href="/Stats" className="btn-stats-link">📊 Go to Stats & Progression</a>
      </div>
    </div>
  );
};

export default ProgressTracker;

