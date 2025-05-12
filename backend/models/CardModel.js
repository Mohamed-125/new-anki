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
    easeFactorDate: {
      type: Date,
      default: Date.now,
    },
    collectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
      index: true,
    },
    language: {
      type: String,
      index: true,
    },
    sectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Section",
      index: true,
    },
    order: {
      type: Number,
      index: true,
    },
    shownInHome: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    lean: true,
  }
);

CardSchema.pre("find", function (next) {
  // Sort by order first (if exists), then by createdAt in ascending order
  this.sort({ order: 1, createdAt: 1 });
  next();
});

CardSchema.post("find", async function (docs) {
  const updatePromises = [];

  const duration = 86400000 * 2;

  for (const card of docs) {
    if (card.easeFactorDate) {
      const easeFactor = card.easeFactor;

      const easeFactorChange =
        easeFactor >= 0.7
          ? 0.2
          : easeFactor < 0.7 && easeFactor >= 0.5
          ? 0.5
          : 0.9;

      const easeFactorTimestamp = new Date(card.easeFactorDate).getTime();
      const currentTimestamp = Date.now();

      if (currentTimestamp - easeFactorTimestamp > duration) {
        updatePromises.push(
          CardModel.updateOne(
            { _id: card._id },
            {
              $set: {
                easeFactor: card.easeFactor - easeFactorChange,
                easeFactorDate: Date.now(),
              },
            }
          )
        );
        card.easeFactor = card.easeFactor - easeFactorChange;
        card.easeFactorDate = new Date();
      }
    }
  }

  if (updatePromises.length > 0) {
    await Promise.all(updatePromises);
  }
});

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel;
