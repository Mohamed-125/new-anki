const express = require("express");
const router = express.Router();

const {
  createCollection,
  forkCollection,
  getCollections,
  getCollection,
  updateCollection,
  deleteCollection,
  batchDelete,
  getPublicCollections,
} = require("../controllers/CollectionController");

const Authorization = require("../middleware/Authorization");

router
  .post("/", Authorization, createCollection)
  .post("/forkCollection/:id", Authorization, forkCollection)
  .get("/", Authorization, getCollections)
  .get("/public", Authorization, getPublicCollections)
  .get("/:id", Authorization, getCollection)
  .patch("/:id", Authorization, updateCollection)
  .delete("/:id", Authorization, deleteCollection)
  .post("/batch-delete", Authorization, batchDelete);

module.exports = router;
