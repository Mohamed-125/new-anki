const express = require("express");
const router = express.Router();
const Authorization = require("../middleware/Authorization");

const {
  createLesson,
  getAllLessons,
  getLesson,
  updateLesson,
  deleteLesson,
} = require("../controllers/LessonController");

router.route("/").post(Authorization, createLesson).get(getAllLessons);
router
  .route("/:id")
  .get(getLesson)
  .patch(Authorization, updateLesson)
  .delete(Authorization, deleteLesson);

module.exports = router;
