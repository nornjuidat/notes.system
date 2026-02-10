const express = require("express");
const router = express.Router();

router.get("/", (req, res) => res.render("public/home"));
router.get("/about", (req, res) => res.render("public/about"));

module.exports = router;
