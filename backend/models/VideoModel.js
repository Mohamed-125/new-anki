const mongoose = require("mongoose");

const VideoSchema = mongoose.Schema(
  {
    url: {
      type: String,
      require: [true, "url is required"],
    },
    title: {
      type: String,
    },
    thumbnail: {
      type: String,
    },

    translatedTranscript: [
      {
        type: String,
      },
    ],
    availableCaptions: [
      {
        value: { type: String },
        text: { type: String },
      },
    ],
    defaultCaption: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    playlistId: {
      type: mongoose.Types.ObjectId,
      ref: "Playlist",
    },
  },
  {
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    toObject: { virtuals: true }, // Ensure virtuals are included in object output
  }
);

VideoSchema.virtual("videoCards", {
  ref: "Card",
  localField: "_id",
  foreignField: "videoId",
});

const VideoModel = mongoose.model("Video", VideoSchema);

module.exports = VideoModel;
