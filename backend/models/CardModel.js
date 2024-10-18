const mongoose = require("mongoose");

const CardSchema = mongoose.Schema({
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

  collectionId: {
    type: mongoose.Types.ObjectId,
    ref: "Collection",
  },
});

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel;
