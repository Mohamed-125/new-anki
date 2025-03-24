const express = require("express");
const router = express.Router();
const Authorization = require("../middleware/Authorization");

const {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/CourseController");

router.route("/").post(Authorization, createCourse).get(getAllCourses);
router
  .route("/:id")
  .get(getCourse)
  .patch(Authorization, updateCourse)
  .delete(Authorization, deleteCourse);

module.exports = router;
