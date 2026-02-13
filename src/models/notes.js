const Note = require("./Note");
const mongoose = require("mongoose");

function toObjectId(id) {
  if (!id) {
    throw new Error("Missing id");
  }

  // אם כבר ObjectId – תחזיר כמו שהוא
  if (id instanceof mongoose.Types.ObjectId) {
    return id;
  }

  // בדיקת תקינות
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId: " + id);
  }

  return new mongoose.Types.ObjectId(id);
}

async function listByUser(userId) {
  return await Note
    .find({ user_id: toObjectId(userId) })
    .sort({ updated_at: -1 })
    .lean();
}

async function getOne({ noteId, userId }) {
  return await Note.findOne({
    _id: toObjectId(noteId),
    user_id: toObjectId(userId)
  }).lean();
}

async function createNote({ userId, title, content }) {
  const note = await Note.create({
    user_id: toObjectId(userId),
    title,
    content
  });

  return { id: note._id };
}

async function updateNote({ noteId, userId, title, content }) {
  const result = await Note.updateOne(
    {
      _id: toObjectId(noteId),
      user_id: toObjectId(userId)
    },
    {
      $set: {
        title,
        content,
        updated_at: new Date()
      }
    }
  );

  return { changes: result.modifiedCount };
}

async function deleteNote({ noteId, userId }) {
  const result = await Note.deleteOne({
    _id: toObjectId(noteId),
    user_id: toObjectId(userId)
  });

  return { changes: result.deletedCount };
}

module.exports = {
  listByUser,
  getOne,
  createNote,
  updateNote,
  deleteNote
};
