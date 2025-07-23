const express = require("express");
const router = express.Router();
const Authorization = require("../middleware/Authorization");

const {
  createLesson,
  getAllLessons,
  getLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} = require("../controllers/LessonController");

router.route("/").post(Authorization, createLesson).get(getAllLessons);
router.route("/grammar").get(getAllLessons);
router.route("/reorder").post(Authorization, reorderLessons);
router
  .route("/:id")
  .get(getLesson)
  .patch(Authorization, updateLesson)
  .delete(Authorization, deleteLesson);

module.exports = router;
