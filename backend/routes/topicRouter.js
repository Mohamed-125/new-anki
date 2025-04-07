const router = require("express").Router();
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicVideos,
  getTopicChannels,
  getTopicTexts,
} = require("../controllers/TopicController");

const Authorization = require("../middleware/Authorization");

router
  .get("/", Authorization, getTopics)
  .get("/:id", Authorization, getTopic)
  .get("/videos/:id", Authorization, getTopicVideos)
  .get("/texts/:id", Authorization, getTopicTexts)
  .get("/channels/:id", Authorization, getTopicChannels)
  .post("/", Authorization, createTopic)
  .patch("/:id", Authorization, updateTopic)
  .delete("/:id", Authorization, deleteTopic);

module.exports = router;
