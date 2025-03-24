const express = require("express");
const router = express.Router();
const Authorization = require("../middleware/Authorization");

const {
  createCourseLevel,
  getAllCourseLevels,
  getCourseLevel,
  updateCourseLevel,
  deleteCourseLevel,
} = require("../controllers/CourseLevelController");

router
  .route("/")
  .post(Authorization, createCourseLevel)
  .get(getAllCourseLevels);
router
  .route("/:id")
  .get(getCourseLevel)
  .patch(Authorization, updateCourseLevel)
  .delete(Authorization, deleteCourseLevel);

module.exports = router;
