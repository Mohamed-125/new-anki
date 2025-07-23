const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "section name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "excercises", "resources"],
      default: "text",
    },
    order: {
      type: Number,
      default: 0,
    },
    content: {},
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "lessonId ID is required"],
      index: true,
    },
  },
  { timestamps: true }
);

sectionSchema.virtual("collections", {
  ref: "Collection",
  localField: "_id",
  foreignField: "sectionId",
});
sectionSchema.virtual("cards", {
  ref: "Card",
  localField: "_id",
  foreignField: "sectionId",
});
sectionSchema.virtual("notes", {
  ref: "Note",
  localField: "_id",
  foreignField: "sectionId",
});

const SectionModel = mongoose.model("Section", sectionSchema);

module.exports = SectionModel;
