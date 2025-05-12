const mongoose = require("mongoose");

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    topicId: {
      type: mongoose.Types.ObjectId,
      ref: "Topic",
      required: true,
      index: true,
    },
    thumbnail: {
      type: String,
    },
    tags: [
      {
        type: String,
        index: true,
      },
    ],
    order: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      index: true,
    },
  },
  { timestamps: true, lean: true }
);

listSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});

const ListModel = mongoose.model("List", listSchema);

module.exports = ListModel;
