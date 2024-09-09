const express = require("express");
const router = express.Router();
const {
  createVideo,
  getUserVideos,
  getVideo,
  updateVideo,
  getVideoTitle,
  deleteVideo,
  getVideoAvailavailableCaptions,
  getTranscript,
} = require("../controllers/VideoController");

const Authorization = require("../middleware/Authorization");

router
  .post(
    "/getVideoAvailavailableCaptions",
    Authorization,
    getVideoAvailavailableCaptions
  )
  .post("/", Authorization, createVideo)
  .get("/", Authorization, getUserVideos)
  .get("/getVideoTitle/:id", Authorization, getVideoTitle)
  .get("/getTranscript", Authorization, getTranscript)
  .get("/:id", Authorization, getVideo)
  .put("/:id", Authorization, updateVideo)
  .delete("/:id", Authorization, deleteVideo);

module.exports = router;
