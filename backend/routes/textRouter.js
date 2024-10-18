const router = require("express").Router();
const {
  getTexts,
  getText,
  updateText,
  deleteText,
  createText,
  batchDelete,
} = require("../controllers/TextController");

const Authorization = require("../middleware/Authorization");

router
  .get("/", Authorization, getTexts)
  .get("/:id", Authorization, getText)
  .post("/", Authorization, createText)
  .put("/:id", Authorization, updateText)
  .delete("/:id", Authorization, deleteText)
  .post("/batch-delete", Authorization, batchDelete);

module.exports = router;
