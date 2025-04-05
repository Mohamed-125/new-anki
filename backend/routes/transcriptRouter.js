const express = require("express");
const router = express.Router();
const TranscriptController = require("../controllers/TranscriptController");

router.post("/get-transcript", TranscriptController.getTranscript);

module.exports = router;
