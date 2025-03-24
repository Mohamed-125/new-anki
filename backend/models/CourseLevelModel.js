const mongoose = require("mongoose");

const courseLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "CourseLevel name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
  },
  { timestamps: true }
);

const CourseLevel = mongoose.model("CourseLevel", courseLevelSchema);

module.exports = CourseLevel;
