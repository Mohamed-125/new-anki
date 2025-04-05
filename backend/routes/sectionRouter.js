const express = require("express");
const router = express.Router();
const Authorization = require("../middleware/Authorization");

const {
  createSection,
  getAllSections,
  getSection,
  updateSection,
  updateOrder,
  deleteSection,
} = require("../controllers/SectionController");

router.route("/").post(Authorization, createSection).get(getAllSections);
router
  .route("/:id")
  .get(getSection)
  .patch(Authorization, updateSection)
  .put(Authorization, updateOrder)
  .delete(Authorization, deleteSection);

module.exports = router;
