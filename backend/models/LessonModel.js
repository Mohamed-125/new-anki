const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lesson name is required"],
      trim: true,
      index: true,
    },
    img: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE=",
    },

    type: {
      type: String,
      enum: ["lesson", "revision", "exam"],
      default: "lesson",
    },
    content: {
      type: String,
      // required: [true, "Lesson content is required"],
    },
    audio: {
      type: String,
      trim: true,
    },
    video: {
      type: String,
      trim: true,
    },
    courseLevelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "courseLevel",
      required: [true, "courseLevel ID is required"],
      index: true,
    },
  },
  { timestamps: true }
);

const Lesson = mongoose.model("Lesson", lessonSchema);

module.exports = Lesson;
