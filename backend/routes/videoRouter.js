const express = require("express");
const router = express.Router();
const {
  createVideo,
  getUserVideos,
  getVideo,
  updateVideo,
  getVideoData,
  deleteVideo,
  getTranscript,
  batchDelete,
  batchMove,
} = require("../controllers/VideoController");

const Authorization = require("../middleware/Authorization");

router
  // .post(
  //   "/getVideoAvailavailableCaptions",
  //   Authorization,
  //   getVideoAvailavailableCaptions
  // )
  .post("/", createVideo)
  .get("/", Authorization, getUserVideos)
  .get("/getVideoData/:videoId", Authorization, getVideoData)
  .get("/getTranscript", getTranscript)
  .get("/:id", Authorization, getVideo)
  .put("/:id", Authorization, updateVideo)
  .delete("/:id", Authorization, deleteVideo)
  .post("/batch-delete", Authorization, batchDelete)
  .post("/batch-move", Authorization, batchMove);

module.exports = router;
