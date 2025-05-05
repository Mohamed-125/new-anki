const express = require("express");
const router = express.Router();
const { scrapeConjugations } = require("../controllers/ConjugationController");

router.post("/", scrapeConjugations);

module.exports = router;
