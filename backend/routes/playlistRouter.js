const express = require("express");
const router = express.Router();

const {
  createPlaylist,
  getPlaylists,
  updatePlaylist,
  deletePlaylist,
  getPlaylist,
  batchDelete,
} = require("../controllers/PlaylistController");

const Authorization = require("../middleware/Authorization");

router
  .post("/", Authorization, createPlaylist)
  .get("/", Authorization, getPlaylists)
  .get("/:id", Authorization, getPlaylist)
  .put("/:id", Authorization, updatePlaylist)
  .delete("/:id", Authorization, deletePlaylist)
  .post("/batch-delete", Authorization, batchDelete);

module.exports = router;
