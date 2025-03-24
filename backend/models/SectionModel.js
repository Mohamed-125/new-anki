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
      required: [true, "Course ID is required"],
    },
  },
  { timestamps: true }
);

const section = mongoose.model("Section", sectionSchema);

module.exports = section;
