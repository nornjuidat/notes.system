const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
  path.join(__dirname, "../data/app.db"),
  (err) => {
    if (err) {
      console.error("❌ SQLite connection error:", err.message);
    } else {
      console.log("✅ Connected to SQLite");
    }
  }
);

/* ================= USERS TABLE ================= */
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.run(createUsersTable, (err) => {
  if (err) {
    console.error("❌ Failed to create users table:", err.message);
  } else {
    console.log("✅ Users table ready");
  }
});

/* ================= NOTES TABLE ================= */
const createNotesTable = `
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
`;

db.run(createNotesTable, (err) => {
  if (err) {
    console.error("❌ Failed to create notes table:", err.message);
  } else {
    console.log("✅ Notes table ready");
  }
});

module.exports = db;
