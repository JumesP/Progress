import React, { useState, useEffect } from "react";
import "../pages/css/Goals.scss";

const Goals = () => {
  const [gridSize, setGridSize] = useState(3);
  const [goals, setGoals] = useState([]);
  const [checkedGoals, setCheckedGoals] = useState({});
  const [selectedGoalIndex, setSelectedGoalIndex] = useState(null);
  const [detailsText, setDetailsText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [resizeError, setResizeError] = useState("");

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("goalsData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setGridSize(parsedData.gridSize || 3);
      setGoals(parsedData.goals || []);
      setCheckedGoals(parsedData.checkedGoals || {});
    } else {
      // Initialize with empty goals
      initializeGoals(3);
    }
  }, []);

  const initializeGoals = (size) => {
    const totalGoals = size * size;
    const newGoals = Array(totalGoals)
      .fill(null)
      .map((_, i) => goals[i] || { text: "", details: "" });
    setGoals(newGoals);
  };

  const saveToLocalStorage = (newSize, newGoals, newCheckedGoals) => {
    localStorage.setItem(
      "goalsData",
      JSON.stringify({
        gridSize: newSize,
        goals: newGoals,
        checkedGoals: newCheckedGoals
      })
    );
  };

  const handleGridSizeChange = (newSize) => {
    // Count how many goals have content (text or details)
    const filledGoals = goals.filter(
      (goal) => goal.text.trim() !== "" || goal.details.trim() !== ""
    ).length;

    const newCapacity = newSize * newSize;

    // Prevent downsizing if there are too many filled goals
    if (filledGoals > newCapacity) {
      setResizeError(
        `Cannot resize to ${newSize}x${newSize} (${newCapacity} slots). You have ${filledGoals} filled goals. Please delete some goals first.`
      );
      // Clear error after 5 seconds
      setTimeout(() => setResizeError(""), 5000);
      return;
    }

    // Clear error if resize is allowed
    setResizeError("");

    // Expand or shrink the goals array while preserving existing data
    const newGoals = Array(newCapacity)
      .fill(null)
      .map((_, i) => goals[i] || { text: "", details: "" });

    setGridSize(newSize);
    setGoals(newGoals);
    saveToLocalStorage(newSize, newGoals, checkedGoals);
  };

  const handleGoalTextChange = (index, text) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], text };
    setGoals(newGoals);
    saveToLocalStorage(gridSize, newGoals, checkedGoals);
  };

  const handleCheckboxChange = (index) => {
    const newCheckedGoals = { ...checkedGoals };
    newCheckedGoals[index] = !newCheckedGoals[index];
    setCheckedGoals(newCheckedGoals);
    saveToLocalStorage(gridSize, goals, newCheckedGoals);
  };

  const handleDeleteGoal = (index) => {
    const newGoals = [...goals];
    newGoals[index] = { text: "", details: "" };
    setGoals(newGoals);

    const newCheckedGoals = { ...checkedGoals };
    delete newCheckedGoals[index];
    setCheckedGoals(newCheckedGoals);

    saveToLocalStorage(gridSize, newGoals, newCheckedGoals);
  };

  const openModal = (index) => {
    setSelectedGoalIndex(index);
    setDetailsText(goals[index]?.details || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedGoalIndex(null);
    setDetailsText("");
  };

  const saveDetails = () => {
    if (selectedGoalIndex !== null) {
      const newGoals = [...goals];
      newGoals[selectedGoalIndex] = {
        ...newGoals[selectedGoalIndex],
        details: detailsText,
      };
      setGoals(newGoals);
      saveToLocalStorage(gridSize, newGoals, checkedGoals);
    }
    closeModal();
  };

  return (
    <div className="goals-page">
      <h1>Goals Bingo Board</h1>

      <div className="controls">
        <label htmlFor="grid-size">Grid Size:</label>
        <select
          id="grid-size"
          value={gridSize}
          onChange={(e) => handleGridSizeChange(parseInt(e.target.value))}
        >
          <option value={3}>3x3</option>
          <option value={4}>4x4</option>
          <option value={5}>5x5</option>
        </select>
      </div>

      {resizeError && (
        <div className="error-message">
          {resizeError}
        </div>
      )}

      <div className={`bingo-board grid-${gridSize}x${gridSize}`}>
        {goals.map((goal, index) => (
          <div key={index} className={`goal-cell ${checkedGoals[index] ? 'checked' : ''}`}>
            <input
              type="text"
              placeholder="Add goal..."
              value={goal.text}
              onChange={(e) => handleGoalTextChange(index, e.target.value)}
              className="goal-input"
            />
            <div className="cell-actions">
              <div className="checkbox-box">
                <input
                  type="checkbox"
                  checked={checkedGoals[index] || false}
                  onChange={() => handleCheckboxChange(index)}
                  className="goal-checkbox"
                />
              </div>
              <button
                className="details-btn"
                onClick={() => openModal(index)}
              >
                Details
              </button>
              <button
                className="btn-delete-box"
                onClick={() => handleDeleteGoal(index)}
                title="Delete goal"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Goal Details</h2>
            <p className="goal-title">{goals[selectedGoalIndex]?.text || "Goal"}</p>
            <textarea
              value={detailsText}
              onChange={(e) => setDetailsText(e.target.value)}
              placeholder="Enter goal details..."
              className="details-textarea"
            />
            <div className="modal-actions">
              <button onClick={saveDetails} className="btn-save">
                Save
              </button>
              <button onClick={closeModal} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;

