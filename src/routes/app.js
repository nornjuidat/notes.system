const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth");
const Notes = require("../models/notes");

const router = express.Router();

router.get("/app", requireAuth, asyncHandler(async (req, res) => {
  const notes = await Notes.listByUser(req.user.id);
  res.render("app/index", { notes });
}));

router.get("/app/new", requireAuth, (req, res) => {
  res.render("app/edit", { mode: "new", note: { title: "", content: "" }, error: null });
});

router.post("/app/new", requireAuth, asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();

  if (title.length < 2) return res.status(400).render("app/edit", { mode: "new", note: { title, content }, error: "Title must be 2+ chars" });
  if (!content) return res.status(400).render("app/edit", { mode: "new", note: { title, content }, error: "Content is required" });

  await Notes.createNote({ userId: req.user.id, title, content });
  res.redirect("/app");
}));

router.get("/app/edit/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const note = await Notes.getOne({ noteId: id, userId: req.user.id });
  if (!note) return res.status(404).render("errors/404");
  res.render("app/edit", { mode: "edit", note, error: null });
}));

router.post("/app/edit/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();

  const result = await Notes.updateNote({ noteId: id, userId: req.user.id, title, content });
  if (result.changes === 0) return res.status(404).render("errors/404");
  res.redirect("/app");
}));

router.post("/app/delete/:id", requireAuth, asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await Notes.deleteNote({ noteId: id, userId: req.user.id });
  res.redirect("/app");
}));

module.exports = router;
