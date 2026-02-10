const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.auth;
  if (!token) return res.redirect("/login");
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: Number(payload.sub), username: payload.username };
    return next();
  } catch (e) {
    res.clearCookie("auth", { path: "/" });
    return res.redirect("/login");
  }
}

function setUserToViews(req, res, next) {
  res.locals.user = req.user || null;
  next();
}

module.exports = { requireAuth, setUserToViews };
