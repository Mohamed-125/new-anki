const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["videos", "lessons", "texts"],
      default: "videos",
    },
    description: {
      type: String,
    },
    courseId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
    },
    topicLanguage: String,
  },
  { timestamps: true, lean: true }
);

topicSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});

// add the lessons and lists virtual or aggerageate

const TopicModel = mongoose.model("Topic", topicSchema);

module.exports = TopicModel;
