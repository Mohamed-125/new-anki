const express = require("express");
const router = express.Router();
const Authorization = require("../middleware/Authorization");

const {
  createSection,
  getAllSections,
  getSection,
  updateSection,
  deleteSection,
} = require("../controllers/SectionController");

router.route("/").post(Authorization, createSection).get(getAllSections);
router
  .route("/:id")
  .get(getSection)
  .patch(Authorization, updateSection)
  .delete(Authorization, deleteSection);

module.exports = router;
