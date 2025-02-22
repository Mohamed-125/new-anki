const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    front: {
      type: String,
      require: [true, "front is required"],
      index: true,
    },
    back: {
      type: String,
      require: [true, "back name is required"],
      index: true,
    },
    content: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      index: true,
    },
    videoId: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
      index: true,
    },
    easeFactor: {
      type: Number,
      default: 0,
      min: 0,
      max: 1,
    },

    collectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
      index: true,
    },
  },
  {
    timestamps: true,
    lean: true,
  }
);

CardSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)

  next();
});

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel;
