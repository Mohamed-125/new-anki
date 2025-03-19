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
  forkVideo,
} = require("../controllers/VideoController");

const Authorization = require("../middleware/Authorization");

router
  // .post(
  //   "/getVideoAvailavailableCaptions",
  //   Authorization,
  //   getVideoAvailavailableCaptions
  // )
  .post("/", createVideo)
  .post("/fork/:id", Authorization, forkVideo)
  .get("/", Authorization, getUserVideos)
  // .get("/getVideoData/:videoId", getVideoData)
  .get("/:id", Authorization, getVideo)
  .patch("/:id", Authorization, updateVideo)
  .delete("/:id", Authorization, deleteVideo)
  .post("/batch-delete", Authorization, batchDelete)
  .post("/batch-move", Authorization, batchMove);

module.exports = router;
