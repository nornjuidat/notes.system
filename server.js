require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const csrf = require("csurf");

const { setUserToViews } = require("./src/middleware/auth");

const publicRoutes = require("./src/routes/public");
const authRoutes = require("./src/routes/auth");
const appRoutes = require("./src/routes/app");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// trust proxy behind Nginx
if (String(process.env.TRUST_PROXY || "").toLowerCase() === "true") {
  app.set("trust proxy", 1);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// EJS layout helper (no extra deps)
app.use((req, res, next) => {
  res.locals.layout = function layout(view, vars = {}) {
    res.locals.__layout = view;
    res.locals.__layoutVars = vars;
  };
  next();
});

app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("combined"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// CSRF (cookie-based)
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(setUserToViews);

// Patch render: render page into layout
const _render = app.response.render;
app.response.render = function (view, locals = {}, cb) {
  const req = this.req;
  const res = this;

  if (req.user) res.locals.user = req.user;

  return _render.call(res, view, locals, function (err, html) {
    if (err) return cb ? cb(err) : req.next(err);

    const layoutView = res.locals.__layout || "layout";
    const layoutVars = res.locals.__layoutVars || {};
    res.locals.__layout = null;
    res.locals.__layoutVars = null;

    return _render.call(res, layoutView, { ...layoutVars, body: html }, cb);
  });
};

// routes
app.use(publicRoutes);
app.use(authRoutes);
app.use(appRoutes);

// 404
app.use((req, res) => res.status(404).render("errors/404"));

// error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Invalid CSRF token. Refresh the page and try again.");
  }
  res.status(500).render("errors/500");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
