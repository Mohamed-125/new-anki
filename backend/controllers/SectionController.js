const SectionModel = require("../models/SectionModel");
const Section = require("../models/SectionModel");
const asyncHandler = require("express-async-handler");
const NoteModel = require("../models/NoteModel");
const mongoose = require("mongoose");

// Create a new section
const createSection = asyncHandler(async (req, res) => {
  const section = await SectionModel.create({ ...req.body });
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

// Duplicate a section
const duplicateSection = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lessonId } = req.query;

  try {
    // Find the original section
    const originalSection = await SectionModel.findById(id).lean();
    if (!originalSection) {
      res.status(404);
      throw new Error("Section not found");
    }

    const newOrder = originalSection.order + 1;

    // Create new section data without _id
    const newSectionData = {
      ...originalSection,
      _id: undefined,
      order: newOrder,
      name: `${originalSection.name} (Copy)`,
      lessonId,
    };

    // Create the new section
    const duplicatedSection = await SectionModel.create(newSectionData);

    // Duplicate associated collections, cards, and notes
    const collections = await mongoose
      .model("Collection")
      .find({ sectionId: id })
      .lean();
    const cards = await mongoose.model("Card").find({ sectionId: id }).lean();
    const notes = await mongoose.model("Note").find({ sectionId: id }).lean();

    // Create duplicates with new sectionId
    if (collections.length) {
      const newCollections = collections.map((collection) => ({
        ...collection,
        _id: undefined,
        sectionId: duplicatedSection._id,
      }));
      await mongoose.model("Collection").insertMany(newCollections);
    }

    if (cards.length) {
      const newCards = cards.map((card) => ({
        ...card,
        _id: undefined,
        sectionId: duplicatedSection._id,
      }));
      await mongoose.model("Card").insertMany(newCards);
    }

    if (notes.length) {
      const newNotes = notes.map((note) => ({
        ...note,
        _id: undefined,
        sectionId: duplicatedSection._id,
      }));
      await mongoose.model("Note").insertMany(newNotes);
    }

    res.status(201).json({
      status: "success",
      data: duplicatedSection,
    });
  } catch (error) {
    console.error("Failed to duplicate section:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to duplicate section",
      error: error.message,
    });
  }
});

module.exports = {
  createSection,
  getAllSections,
  getSection,
  updateSection,
  updateOrder,
  deleteSection,
  duplicateSection,
};
