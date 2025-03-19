const express = require("express");
const router = express.Router();
const {
  createCard,
  getUserCards,
  getCard,
  updateCard,
  deleteCard,
  batchDelete,
  batchMove,
} = require("../controllers/CardController");

const Authorization = require("../middleware/Authorization");

router
  .post("/", Authorization, createCard)
  .get("/", Authorization, getUserCards)
  .get("/:id", Authorization, getCard)
  .patch("/:id", Authorization, updateCard)
  .delete("/:id", Authorization, deleteCard)
  .post("/batch-delete", Authorization, batchDelete)
  .post("/batch-move", Authorization, batchMove);

module.exports = router;
