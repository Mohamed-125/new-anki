const { verify } = require("jsonwebtoken");
const CourseLevel = require("../models/CourseLevelModel.js");
const asyncHandler = require("express-async-handler");
const ProgressModel = require("../models/ProgressModel.js");
const LessonModel = require("../models/LessonModel.js");

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
  const token = req.cookies?.token;
  const { id: userId } = verify(token, process.env.JWT_KEY);

  const limit = 10;
  let page = +pageNumber || 0;

  try {
    const courseLevelsCount = await CourseLevel.countDocuments({ courseId });
    const skipNumber = page * limit;
    const remaining = Math.max(0, courseLevelsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const courseLevels = await CourseLevel.find({ courseId })
      .sort({ createdAt: -1 })
      .skip(skipNumber)
      .limit(limit)
      .lean();

    // Fetch all progress for the user in the requested course levels
    const progressRecords = await ProgressModel.find({
      userId,
      courseLevelId: { $in: courseLevels.map((cl) => cl._id) },
    }).lean();

    console.log(progressRecords);
    // Map progress to course levels
    const courseLevelsWithProgress = await Promise.all(
      courseLevels.map(async (courseLevel) => {
        const progress = progressRecords.find(
          (p) => p.courseLevelId.toString() === courseLevel._id.toString()
        );
        const totalLessons = await LessonModel.countDocuments({
          courseLevelId: courseLevel._id,
        });

        console.log("totalLessons", totalLessons);
        const completedLessons = progress
          ? progress?.completedLessons?.length
          : 0;

        console.log(
          "progress.completedLessons.length",
          progress?.completedLessons?.length
        );

        const completionPercentage = totalLessons
          ? (completedLessons / totalLessons) * 100
          : 0;

        return {
          ...courseLevel,
          completionPercentage: Math.round(completionPercentage),
        };
      })
    );

    res.status(200).json({
      courseLevels: courseLevelsWithProgress,
      nextPage,
      courseLevelsCount,
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).send(error);
  }
});

// Get a single courseLevel
const getCourseLevel = asyncHandler(async (req, res) => {
  const token = req.cookies?.token;
  const { id: userId } = verify(token, process.env.JWT_KEY);

  const courseLevel = await CourseLevel.findById(req.params.id);

  if (!courseLevel) {
    res.status(404);
    throw new Error("CourseLevel not found");
  }

  // Fetch progress for the user
  const progress = await ProgressModel.findOne({
    userId,
    courseLevelId: courseLevel._id,
  }).lean();

  // Get total lessons
  const totalLessons = await LessonModel.countDocuments({
    courseLevelId: courseLevel._id,
  });
  const completedLessons = progress ? progress.completedLessons.length : 0;
  const completionPercentage = totalLessons
    ? (completedLessons / totalLessons) * 100
    : 0;

  res.status(200).json({
    ...courseLevel.toObject(),
    completionPercentage: Math.round(completionPercentage),
  });
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
