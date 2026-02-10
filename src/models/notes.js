const db = require("../db");

function listByUser(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC",
      [userId],
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });
}

function getOne({ noteId, userId }) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId],
      (err, row) => (err ? reject(err) : resolve(row))
    );
  });
}

function createNote({ userId, title, content }) {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO notes (user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      [userId, title, content, now, now],
      function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      }
    );
  });
}

function updateNote({ noteId, userId, title, content }) {
  const now = new Date().toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      [title, content, now, noteId, userId],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

function deleteNote({ noteId, userId }) {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteId, userId],
      function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

module.exports = { listByUser, getOne, createNote, updateNote, deleteNote };
