const router = require("express").Router();
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  batchDelete,
  addVideoToTopic,
  addTextToTopic,
  removeVideoFromTopic,
  removeTextFromTopic,
} = require("../controllers/TopicController");

const Authorization = require("../middleware/Authorization");

router
  .get("/", Authorization, getTopics)
  .get("/:id", Authorization, getTopic)
  .post("/", Authorization, createTopic)
  .patch("/:id", Authorization, updateTopic)
  .delete("/:id", Authorization, deleteTopic);

module.exports = router;
