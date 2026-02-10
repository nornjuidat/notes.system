const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "data", "app.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ DB error:", err);
  else console.log("✅ Connected to SQLite:", dbPath);
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON;");
});

module.exports = db;
