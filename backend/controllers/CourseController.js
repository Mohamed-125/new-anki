const Course = require("../models/CourseModel");
const asyncHandler = require("express-async-handler");

// Create a new course
const createCourse = asyncHandler(async (req, res) => {
  console.log(req.body);
  const course = await Course.create(req.body);
  res.status(201).json({
    course,
  });
});

// Get all courses
const getAllCourses = asyncHandler(async (req, res) => {
  const { page: pageNumber } = req.query;
  const limit = 10;
  let page = +pageNumber || 0;

  try {
    const coursesCount = await Course.countDocuments();
    const skipNumber = page * limit;
    const remaining = Math.max(0, coursesCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const courses = await Course.find().skip(skipNumber).limit(limit);

    res.status(200).json({
      courses,
      nextPage,
      coursesCount,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch courses", error);
  }
});

// Get a single course
const getCourse = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { lang } = req.query;
  const query = {};

  console.log(req.query);
  if (lang) {
    query.lang = lang;
  } else {
    query._id = id;
  }

  const course = await Course.findOne(query);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  res.status(200).json(course);
});

// Update a course
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  res.status(200).json({
    status: "success",
    data: course,
  });
});

// Delete a course
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
};
