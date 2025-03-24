const Section = require("../models/SectionModel");
const asyncHandler = require("express-async-handler");

// Create a new section
const createSection = asyncHandler(async (req, res) => {
  const lessonId = req.query.lessonId;
  const section = await Section.create({ ...req.body, lessonId });
  res.status(201).json({
    status: "success",
    data: section,
  });
});

// Get all sections
const getAllSections = asyncHandler(async (req, res) => {
  const { page: pageNumber, lessonId } = req.query;
  const limit = 10;
  let page = +pageNumber || 0;

  try {
    const sectionsCount = await Section.countDocuments({ lessonId });
    const skipNumber = page * limit;
    const remaining = Math.max(0, sectionsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const sections = await Section.find({ lessonId })
      .skip(skipNumber)
      .limit(limit);

    res.status(200).json({
      sections,
      nextPage,
      sectionsCount,
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to fetch sections", error);
  }
});
// Get a single section
const getSection = asyncHandler(async (req, res) => {
  const section = await Section.findById(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }
  res.status(200).json(section);
});

// Update a section
const updateSection = asyncHandler(async (req, res) => {
  console.log("upadate");
  const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }
  res.status(200).json({
    status: "success",
    data: section,
  });
});

// Delete a section
const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findByIdAndDelete(req.params.id);
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  createSection,
  getAllSections,
  getSection,
  updateSection,
  deleteSection,
};
