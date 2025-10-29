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
  getAllCollectionCards,
} = require("../controllers/CollectionController");

const Authorization = require("../middleware/Authorization");

router
  .post("/", Authorization, createCollection)
  .post("/fork/:id", Authorization, forkCollection)
  .get("/", Authorization, getCollections)
  // .get("/public", Authorization, getPublicCollections)
  .get("/:id", Authorization, getCollection)
  .get("/:id/cards", Authorization, getAllCollectionCards)
  .patch("/:id", Authorization, updateCollection)
  .delete("/:id", Authorization, deleteCollection);
// .post("/batch-delete", Authorization, batchDelete);

module.exports = router;
