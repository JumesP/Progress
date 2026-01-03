import React, { useState, useEffect } from "react";
import "../pages/css/BooksPage.scss";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    score: 5,
    startDate: "",
    endDate: "",
  });
  const [sortBy, setSortBy] = useState("date"); // date, score, title
  const [filterScore, setFilterScore] = useState(0); // 0 = all

  // Load books from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem("booksData");
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
  }, []);

  // Save books to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("booksData", JSON.stringify(books));
  }, [books]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" ? parseInt(value) : value,
    }));
  };

  const handleAddBook = () => {
    if (formData.title.trim()) {
      if (editingId) {
        // Update existing book
        setBooks(
          books.map((book) =>
            book.id === editingId
              ? { ...book, ...formData, updatedAt: new Date().toISOString() }
              : book
          )
        );
        setEditingId(null);
      } else {
        // Add new book
        const newBook = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        };
        setBooks([newBook, ...books]);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        score: 5,
        startDate: "",
        endDate: "",
      });
      setShowForm(false);
    }
  };

  const handleEditBook = (book) => {
    setFormData({
      title: book.title,
      description: book.description,
      score: book.score,
      startDate: book.startDate,
      endDate: book.endDate,
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleDeleteBook = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      setBooks(books.filter((book) => book.id !== id));
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      score: 5,
      startDate: "",
      endDate: "",
    });
  };

  // Sort and filter books
  const processedBooks = books
    .filter((book) => (filterScore === 0 ? true : book.score >= filterScore))
    .sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.score - a.score;
        case "title":
          return a.title.localeCompare(b.title);
        case "date":
        default:
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
      }
    });

  const getReadingDays = (book) => {
    if (!book.startDate || !book.endDate) return null;
    const start = new Date(book.startDate);
    const end = new Date(book.endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getScoreColor = (score) => {
    if (score >= 4) return "#10b981"; // Green
    if (score >= 3) return "#f59e0b"; // Amber
    if (score >= 2) return "#ef4444"; // Red
    return "#6b7280"; // Gray
  };

  const renderStars = (score) => {
    return "★".repeat(score) + "☆".repeat(5 - score);
  };

  return (
    <div className="books-page">
      <h1>📚 My Books</h1>
      <p className="page-subtitle">
        Track the books you've read and share your thoughts
      </p>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="left-controls">
          <button
            className="btn-add-book"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "➕ Add Book"}
          </button>
        </div>

        <div className="right-controls">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="control-select"
          >
            <option value="date">Sort by: Recently Added</option>
            <option value="score">Sort by: Highest Score</option>
            <option value="title">Sort by: Title A-Z</option>
          </select>

          <select
            value={filterScore}
            onChange={(e) => setFilterScore(parseInt(e.target.value))}
            className="control-select"
          >
            <option value={0}>Filter: All Books</option>
            <option value={1}>Filter: 1+ Stars</option>
            <option value={2}>Filter: 2+ Stars</option>
            <option value={3}>Filter: 3+ Stars</option>
            <option value={4}>Filter: 4+ Stars</option>
            <option value={5}>Filter: 5 Stars Only</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="book-form-section">
          <h2>{editingId ? "Edit Book" : "Add New Book"}</h2>

          <div className="form-group">
            <label htmlFor="title">Book Title *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter book title..."
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Review & Notes</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Share your thoughts about the book..."
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="score">Score</label>
              <div className="score-selector">
                <select
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value={1}>1 Star</option>
                  <option value={2}>2 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
                <span className="stars-display">{renderStars(formData.score)}</span>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-save"
              onClick={handleAddBook}
            >
              {editingId ? "Update Book" : "Add Book"}
            </button>
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      {books.length > 0 && (
        <div className="stats-section">
          <div className="stat-card">
            <h3>Total Books</h3>
            <p className="stat-value">{books.length}</p>
          </div>
          <div className="stat-card">
            <h3>Average Score</h3>
            <p className="stat-value">
              {(books.reduce((sum, b) => sum + b.score, 0) / books.length).toFixed(1)}
            </p>
          </div>
          <div className="stat-card">
            <h3>5-Star Books</h3>
            <p className="stat-value">{books.filter((b) => b.score === 5).length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Reading Days</h3>
            <p className="stat-value">
              {books
                .map(getReadingDays)
                .filter((d) => d !== null)
                .reduce((sum, d) => sum + d, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Books Grid */}
      {processedBooks.length > 0 ? (
        <div className="books-grid">
          {processedBooks.map((book) => {
            const readingDays = getReadingDays(book);
            return (
              <div key={book.id} className="book-card">
                <div className="book-header">
                  <h3 className="book-title">{book.title}</h3>
                  <div
                    className="score-badge"
                    style={{ backgroundColor: getScoreColor(book.score) }}
                  >
                    {book.score}★
                  </div>
                </div>

                {book.description && (
                  <p className="book-description">{book.description}</p>
                )}

                <div className="book-stars">
                  <span className="stars">{renderStars(book.score)}</span>
                </div>

                {(book.startDate || book.endDate) && (
                  <div className="book-dates">
                    {book.startDate && (
                      <div className="date-info">
                        <span className="date-label">Started:</span>
                        <span className="date-value">{formatDate(book.startDate)}</span>
                      </div>
                    )}
                    {book.endDate && (
                      <div className="date-info">
                        <span className="date-label">Finished:</span>
                        <span className="date-value">{formatDate(book.endDate)}</span>
                      </div>
                    )}
                    {readingDays !== null && (
                      <div className="date-info">
                        <span className="date-label">Days to Read:</span>
                        <span className="date-value">{readingDays} days</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="book-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEditBook(book)}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteBook(book.id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>📖 No books yet</h2>
          <p>Start tracking your reading journey by adding your first book!</p>
          <button className="btn-add-book" onClick={() => setShowForm(true)}>
            ➕ Add Your First Book
          </button>
        </div>
      )}
    </div>
  );
};

export default BooksPage;

