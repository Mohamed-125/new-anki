const mongoose = require("mongoose");

const CardSchema = mongoose.Schema({
  word: {
    type: String,
    require: [true, "word is required"],
  },
  translation: {
    type: String,
    require: [true, "translation name is required"],
  },
  examples: {
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

  collectionId: {
    type: mongoose.Types.ObjectId,
    ref: "Collection",
  },
});

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel;
