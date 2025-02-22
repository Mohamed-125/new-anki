const router = require("express").Router();
const {
  getNotes,
  getNote,
  updateNote,
  deleteNote,
  createNote,
  batchDelete,
} = require("../controllers/NoteController");

const Authorization = require("../middleware/Authorization");

router
  .get("/", Authorization, getNotes)
  .get("/:id", Authorization, getNote)
  .post("/", Authorization, createNote)
  .put("/:id", Authorization, updateNote)
  .delete("/:id", Authorization, deleteNote)
  .post("/batch-delete", Authorization, batchDelete);

module.exports = router;
