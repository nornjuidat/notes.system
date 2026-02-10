const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const { findByUsername, createUser } = require("../models/users");
const { authLimiter } = require("../middleware/limits");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: "7d" }
  );
}

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

router.get("/register", (req, res) => res.render("auth/register", { error: null, form: {} }));
router.get("/login", (req, res) => res.render("auth/login", { error: null, form: {} }));

router.post("/register", authLimiter, asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (username.length < 3) return res.status(400).render("auth/register", { error: "Username must be 3+ chars", form: { username } });
  if (password.length < 6) return res.status(400).render("auth/register", { error: "Password must be 6+ chars", form: { username } });

  const exists = await findByUsername(username);
  if (exists) return res.status(409).render("auth/register", { error: "Username already exists", form: { username } });

  const password_hash = await bcrypt.hash(password, 12);
  const user = await createUser({ username, password_hash });

  const token = signToken(user);
  res.cookie("auth", token, cookieOptions());
  res.redirect("/app");
}));

router.post("/login", authLimiter, asyncHandler(async (req, res) => {
  const username = String(req.body.username || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  const user = await findByUsername(username);
  if (!user) return res.status(401).render("auth/login", { error: "Invalid username or password", form: { username } });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).render("auth/login", { error: "Invalid username or password", form: { username } });

  const token = signToken(user);
  res.cookie("auth", token, cookieOptions());
  res.redirect("/app");
}));

router.post("/logout", (req, res) => {
  res.clearCookie("auth", { path: "/" });
  res.redirect("/login");
});

module.exports = router;
