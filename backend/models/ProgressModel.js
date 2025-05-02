const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: {
    index: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  courseLevelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CourseLevel",
    index: true,
    required: false,
  },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Lesson" }],
});
const ProgressModel = mongoose.model("Progress", progressSchema);

module.exports = ProgressModel;
