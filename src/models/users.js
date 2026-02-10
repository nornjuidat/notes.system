const db = require("../db");

function findByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function createUser({ username, password_hash }) {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)",
      [username, password_hash, now],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, username, created_at: now });
      }
    );
  });
}

module.exports = { findByUsername, createUser };
