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
      enum: ["lessons", "lists"],
      default: "lessons",
    },
    description: {
      type: String,
    },
    language: {
      type: String,
      index: true,
    },
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
