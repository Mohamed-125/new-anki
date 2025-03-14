const router = require("express").Router();
const {
  getTexts,
  getText,
  updateText,
  deleteText,
  createText,
  batchDelete,
  forkText,
} = require("../controllers/TextController");

const Authorization = require("../middleware/Authorization");

router
  .get("/", Authorization, getTexts)
  .get("/:id", Authorization, getText)
  .post("/", Authorization, createText)
  .post("/fork/:id", Authorization, forkText)
  .put("/:id", Authorization, updateText)
  .delete("/:id", Authorization, deleteText)
  .post("/batch-delete", Authorization, batchDelete);

module.exports = router;
