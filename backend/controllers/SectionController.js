const SectionModel = require("../models/SectionModel");
const Section = require("../models/SectionModel");
const asyncHandler = require("express-async-handler");
const NoteModel = require("../models/NoteModel");

// Create a new section
const createSection = asyncHandler(async (req, res) => {
  const lessonId = req.query.lessonId;
  const section = await SectionModel.create({ ...req.body, lessonId });
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
    const sectionsCount = await SectionModel.countDocuments({ lessonId });
    const skipNumber = page * limit;
    const remaining = Math.max(0, sectionsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const sections = await SectionModel.find({ lessonId })
      .sort({ order: 1 })
      .skip(skipNumber)
      .limit(limit)
      .populate({
        path: "collections",
        select: "_id name",
        options: { lean: true },
      })
      .populate({
        path: "cards",
        select: "_id front back collectionId",
        options: { lean: true },
      })
      .populate({
        path: "notes",
        select: "_id title ",
        options: { lean: true },
      })
      .lean();

    return res.status(200).json({
      nextPage,
      sections,
      sectionsCount,
    });
  } catch (error) {
    console.log("Failed to fetch sections", error);

    return res.status(500).send(error);
  }
});
// Get a single section
const getSection = asyncHandler(async (req, res) => {
  const section = await SectionModel.findById(req.params.id)
    .populate({
      path: "collections",
      select: "_id name",
      options: { lean: true },
    })
    .populate({
      path: "cards",
      select: "_id front back collectionId",
      options: { lean: true },
    })
    .populate({
      path: "notes",
      select: "_id title content",
      options: { lean: true },
    })
    .lean();

  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }
  res.status(200).json({ section, notes });
});

// Update a section
const updateSection = asyncHandler(async (req, res) => {
  console.log("upadate");
  const section = await SectionModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!section) {
    res.status(404);
    throw new Error("Section not found");
  }
  res.status(200).json({
    status: "success",
    data: section,
  });
});

const updateOrder = asyncHandler(async (req, res) => {
  const { sections } = req.body;

  const bulkOps = sections.map((section) => ({
    updateOne: {
      filter: { _id: section._id },
      update: { $set: { order: section.order } },
    },
  }));

  try {
    await SectionModel.bulkWrite(bulkOps);
    res.status(200).json({ message: "Order updated" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order", error });
  }
});

// Delete a section
const deleteSection = asyncHandler(async (req, res) => {
  const section = await SectionModel.findByIdAndDelete(req.params.id);
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
  updateOrder,
  deleteSection,
};
