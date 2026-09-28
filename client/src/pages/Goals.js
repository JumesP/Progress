import React, { useState, useEffect } from "react";
import { FaTrashCan } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import "../pages/css/Goals.scss";

const STORAGE_KEY = "goalsBoardsData";
const LEGACY_KEY = "goalsData"; // your old single-board key (migrated automatically)

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const emptyGoal = () => ({ text: "", details: "", emoji: "" });

const makeBoard = (name = "My Goals", gridSize = 3) => ({
  id: uid(),
  name,
  gridSize,
  goals: Array(gridSize * gridSize).fill(null).map(emptyGoal),
  checkedGoals: {},
  createdAt: Date.now(),
});

const loadState = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.boards) && saved.boards.length) {
      const activeId = saved.boards.some((b) => b.id === saved.activeId)
        ? saved.activeId
        : saved.boards[0].id;
      return { boards: saved.boards, activeId };
    }
  } catch (e) {
    // fall through to migration / default
  }

  // Migrate the old single board, if there is one
  try {
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (legacy) {
      const size = legacy.gridSize || 3;
      const board = {
        ...makeBoard("My Goals", size),
        goals: legacy.goals?.length
          ? legacy.goals
          : Array(size * size).fill(null).map(emptyGoal),
        checkedGoals: legacy.checkedGoals || {},
      };
      return { boards: [board], activeId: board.id };
    }
  } catch (e) {
    // ignore
  }

  const board = makeBoard();
  return { boards: [board], activeId: board.id };
};

const Goals = () => {
  const [{ boards, activeId }, setState] = useState(loadState);
  const [selectedGoalIndex, setSelectedGoalIndex] = useState(null);
  const [detailsText, setDetailsText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteBoard, setShowDeleteBoard] = useState(false);
  const [resizeError, setResizeError] = useState("");

  const board = boards.find((b) => b.id === activeId) || boards[0];
  const { gridSize, goals, checkedGoals } = board;

  // Persist everything whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ boards, activeId }));
    } catch (e) {
      console.error("Could not save boards", e);
    }
  }, [boards, activeId]);

  /* ---------- helpers ---------- */

  // Update the active board with a partial object (or a function returning one)
  const updateBoard = (patch) =>
    setState((prev) => ({
      ...prev,
      boards: prev.boards.map((b) =>
        b.id === prev.activeId
          ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) }
          : b
      ),
    }));

  /* ---------- board management ---------- */

  const handleSelectBoard = (id) => {
    setResizeError("");
    setState((prev) => ({ ...prev, activeId: id }));
  };

  const handleNewBoard = () => {
    const newBoard = makeBoard(`Board ${boards.length + 1}`, 3);
    setResizeError("");
    setState((prev) => ({
      boards: [...prev.boards, newBoard],
      activeId: newBoard.id,
    }));
  };

  const handleDuplicateBoard = () => {
    const copy = {
      ...JSON.parse(JSON.stringify(board)),
      id: uid(),
      name: `${board.name} (copy)`,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      boards: [...prev.boards, copy],
      activeId: copy.id,
    }));
  };

  const handleRenameBoard = (name) => updateBoard({ name });

  const handleDeleteBoard = () => {
    setState((prev) => {
      const remaining = prev.boards.filter((b) => b.id !== prev.activeId);
      if (remaining.length === 0) {
        const fresh = makeBoard();
        return { boards: [fresh], activeId: fresh.id };
      }
      return { boards: remaining, activeId: remaining[0].id };
    });
    setShowDeleteBoard(false);
  };

  /* ---------- grid / goal handlers ---------- */

  const handleGridSizeChange = (newSize) => {
    const filledGoals = goals.filter(
      (goal) =>
        (goal.text || "").trim() !== "" || (goal.details || "").trim() !== ""
    ).length;
    const newCapacity = newSize * newSize;

    if (filledGoals > newCapacity) {
      setResizeError(
        `Cannot resize to ${newSize}x${newSize} (${newCapacity} slots). You have ${filledGoals} filled goals. Please delete some goals first.`
      );
      setTimeout(() => setResizeError(""), 5000);
      return;
    }

    setResizeError("");
    const newGoals = Array(newCapacity)
      .fill(null)
      .map((_, i) => goals[i] || emptyGoal());

    updateBoard({ gridSize: newSize, goals: newGoals });
  };

  const handleGoalFieldChange = (index, field, value) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    updateBoard({ goals: newGoals });
  };

  const handleCheckboxChange = (index) => {
    updateBoard({
      checkedGoals: { ...checkedGoals, [index]: !checkedGoals[index] },
    });
  };

  const handleDeleteGoal = (index) => {
    const newGoals = [...goals];
    newGoals[index] = emptyGoal();
    const newCheckedGoals = { ...checkedGoals };
    delete newCheckedGoals[index];
    updateBoard({ goals: newGoals, checkedGoals: newCheckedGoals });
  };

  /* ---------- details modal ---------- */

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
      handleGoalFieldChange(selectedGoalIndex, "details", detailsText);
    }
    closeModal();
  };

  const completedCount = Object.values(checkedGoals).filter(Boolean).length;

  return (
    <div className="goals-page">
      <h1>Goals Bingo Board</h1>

      {/* Board manager */}
      <div className="board-manager">
        <div className="board-row">
          <label htmlFor="board-select">Board:</label>
          <select
            id="board-select"
            value={board.id}
            onChange={(e) => handleSelectBoard(e.target.value)}
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name || "Untitled"}
              </option>
            ))}
          </select>
        </div>

        <div className="board-row">
          <label htmlFor="board-name">Name:</label>
          <input
            id="board-name"
            type="text"
            className="board-name-input"
            value={board.name}
            placeholder="Board name..."
            maxLength={40}
            onChange={(e) => handleRenameBoard(e.target.value)}
          />
        </div>

        <div className="board-row board-buttons">
          <button className="btn-board btn-new" onClick={handleNewBoard}>
            + New
          </button>
          <button className="btn-board" onClick={handleDuplicateBoard}>
            Duplicate
          </button>
          <button
            className="btn-board btn-danger"
            onClick={() => setShowDeleteBoard(true)}
          >
            Delete board
          </button>
        </div>
      </div>

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
        <span className="progress">
          {completedCount}/{gridSize * gridSize} done
        </span>
      </div>

      {resizeError && <div className="error-message">{resizeError}</div>}

      <div className={`bingo-board grid-${gridSize}x${gridSize}`}>
        {goals.map((goal, index) => (
          <div
            key={index}
            className={`goal-cell ${checkedGoals[index] ? "checked" : ""} ${!(goal.text || "").trim() && !(goal.emoji || "").trim()
                ? "empty"
                : ""
              }`}
          >
            <input
              type="text"
              placeholder="😀"
              value={goal.emoji || ""}
              onChange={(e) =>
                handleGoalFieldChange(index, "emoji", e.target.value)
              }
              className="goal-emoji"
              maxLength="2"
            />
            <input
              type="text"
              placeholder="Add goal..."
              value={goal.text}
              onChange={(e) =>
                handleGoalFieldChange(index, "text", e.target.value)
              }
              className="goal-input"
            />
            <div className="cell-actions">
              <button
                className={`checkbox-btn ${checkedGoals[index] ? "checked" : ""
                  }`}
                onClick={() => handleCheckboxChange(index)}
                title="Toggle goal completion"
              >
                <FaCheck />
              </button>
              <button className="details-btn" onClick={() => openModal(index)}>
                Details
              </button>
              <button
                className="btn-delete-box"
                onClick={() => handleDeleteGoal(index)}
                title="Delete goal"
              >
                <FaTrashCan />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Goal details modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Goal Details</h2>
            <p className="goal-title">
              {goals[selectedGoalIndex]?.text || "Goal"}
            </p>
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

      {/* Delete board confirmation */}
      {showDeleteBoard && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteBoard(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete board?</h2>
            <p className="goal-title">
              "{board.name || "Untitled"}" and all of its goals will be
              permanently deleted.
            </p>
            <div className="modal-actions">
              <button onClick={handleDeleteBoard} className="btn-confirm-delete">
                Delete
              </button>
              <button
                onClick={() => setShowDeleteBoard(false)}
                className="btn-cancel"
              >
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
