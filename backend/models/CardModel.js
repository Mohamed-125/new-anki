const mongoose = require("mongoose");

const CardSchema = mongoose.Schema(
  {
    front: {
      type: String,
      require: [true, "front is required"],
    },
    back: {
      type: String,
      require: [true, "back name is required"],
    },
    content: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    videoId: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
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
    },
  },
  { timestamps: true }
);

CardSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)

  next();
});

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel;
