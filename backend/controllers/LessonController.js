const Lesson = require("../models/LessonModel");
const asyncHandler = require("express-async-handler");
const { verify } = require("jsonwebtoken");
const ProgressModel = require("../models/ProgressModel");

// Create a new lesson
const createLesson = asyncHandler(async (req, res) => {
  const { courseLevelId } = req.query;
  const lesson = await Lesson.create({ ...req.body, courseLevelId });
  res.status(201).json(lesson);
});

// Get all lessons
const getAllLessons = asyncHandler(async (req, res) => {
  const { page: pageNumber, courseLevelId, category } = req.query;
  const limit = 10;
  let page = +pageNumber || 0;
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  const { id: userId } = verify(token, process.env.JWT_KEY);
  try {
    const query = {};
    if (category) query.category = category;
    if (courseLevelId) query.courseLevelId = courseLevelId;
    const lessonsCount = await Lesson.countDocuments(query);
    const skipNumber = page * limit;
    const remaining = Math.max(0, lessonsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const lessons = await Lesson.find(query)
      .skip(skipNumber)
      .limit(limit)
      .lean();

    const progress = await ProgressModel.find();

    const promises = lessons.map((lesson) => {
      return ProgressModel.findOne({
        userId: userId,
        completedLessons: { $in: [lesson._id] },
      }).lean();
    });

    const results = await Promise.all(promises);

    lessons.forEach((doc, index) => {
      Object.assign(doc, { isCompleted: results[index] ? true : false });
    });

    res.status(200).json({
      lessons: lessons,
      nextPage,
      lessonsCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lessons",
      error: error.message,
    });
  }
});
// Get a single lesson
const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }
  res.status(200).json(lesson);
});

// Update a lesson
const updateLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }
  res.status(200).json({
    status: "success",
    data: lesson,
  });
});

// Delete a lesson
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) {
    res.status(404);
    throw new Error("Lesson not found");
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createLesson,
  getAllLessons,
  getLesson,
  updateLesson,
  deleteLesson,
};
