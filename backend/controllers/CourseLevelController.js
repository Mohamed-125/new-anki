const CourseLevel = require("../models/CourseLevelModel.js");
const asyncHandler = require("express-async-handler");

// Create a new courseLevel
const createCourseLevel = asyncHandler(async (req, res) => {
  const courseId = req.query.courseId;
  const courseLevel = await CourseLevel.create({ ...req.body, courseId });
  res.status(201).json({
    status: "success",
    data: courseLevel,
  });
});

// Get all courseLevels
const getAllCourseLevels = asyncHandler(async (req, res) => {
  const { page: pageNumber, courseId } = req.query;
  const limit = 10;
  let page = +pageNumber || 0;

  try {
    const courseLevelsCount = await CourseLevel.countDocuments({ courseId });
    const skipNumber = page * limit;
    const remaining = Math.max(0, courseLevelsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const courseLevels = await CourseLevel.find({ courseId })
      .skip(skipNumber)
      .limit(limit);

    res.status(200).json({
      courseLevels,
      nextPage,
      courseLevelsCount,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch courseLevels", error);
  }
});
// Get a single courseLevel
const getCourseLevel = asyncHandler(async (req, res) => {
  const courseLevel = await CourseLevel.findById(req.params.id);
  if (!courseLevel) {
    res.status(404);
    throw new Error("CourseLevel not found");
  }
  res.status(200).json(courseLevel);
});

// Update a courseLevel
const updateCourseLevel = asyncHandler(async (req, res) => {
  const courseLevel = await CourseLevel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!courseLevel) {
    res.status(404);
    throw new Error("CourseLevel not found");
  }
  res.status(200).json({
    status: "success",
    data: courseLevel,
  });
});

// Delete a courseLevel
const deleteCourseLevel = asyncHandler(async (req, res) => {
  const courseLevel = await CourseLevel.findByIdAndDelete(req.params.id);
  if (!courseLevel) {
    res.status(404);
    throw new Error("CourseLevel not found");
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createCourseLevel,
  getAllCourseLevels,
  getCourseLevel,
  updateCourseLevel,
  deleteCourseLevel,
};
