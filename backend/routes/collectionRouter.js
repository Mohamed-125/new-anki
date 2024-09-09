const express = require("express");
const router = express.Router();

const {
  createCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/CollectionController");

const Authorization = require("../middleware/Authorization");

router
  .post("/", Authorization, createCollection)
  .get("/", Authorization, getCollections)
  .get("/:id", Authorization, getCollection)
  .put("/:id", Authorization, updateCollection)
  .delete("/:id", Authorization, deleteCollection);

module.exports = router;
