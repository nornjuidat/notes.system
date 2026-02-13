const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const Notes = require("../models/notes");

const router = express.Router();

// 📌 רשימת notes
router.get(
  "/app",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notes = await Notes.listByUser(req.user._id);
    res.render("app/index", { notes });
  })
);

// 📌 טופס יצירת note
router.get("/app/new", requireAuth, (req, res) => {
  res.render("app/edit", {
    mode: "new",
    note: { title: "", content: "" },
    error: null
  });
});

// 📌 יצירת note
router.post(
  "/app/new",
  requireAuth,
  asyncHandler(async (req, res) => {
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();

    if (title.length < 2)
      return res.status(400).render("app/edit", {
        mode: "new",
        note: { title, content },
        error: "Title must be 2+ chars"
      });

    if (!content)
      return res.status(400).render("app/edit", {
        mode: "new",
        note: { title, content },
        error: "Content is required"
      });

    await Notes.createNote({
      userId: req.user._id,
      title,
      content
    });

    res.redirect("/app");
  })
);

// 📌 טופס עריכה
router.get(
  "/app/edit/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const noteId = req.params.id; // ✅ ObjectId string
    const note = await Notes.getOne({
      noteId,
      userId: req.user._id
    });

    if (!note) return res.status(404).render("errors/404");
    res.render("app/edit", { mode: "edit", note, error: null });
  })
);

// 📌 עדכון note
router.post(
  "/app/edit/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const noteId = req.params.id;
    const title = String(req.body.title || "").trim();
    const content = String(req.body.content || "").trim();

    const result = await Notes.updateNote({
      noteId,
      userId: req.user._id,
      title,
      content
    });

    if (result.changes === 0)
      return res.status(404).render("errors/404");

    res.redirect("/app");
  })
);

// 📌 מחיקה
router.post(
  "/app/delete/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const noteId = req.params.id;

    await Notes.deleteNote({
      noteId,
      userId: req.user._id
    });

    res.redirect("/app");
  })
);

module.exports = router;
