const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
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

    defaultCaptionData: {
      name: { type: String },
      transcript: [
        {
          end: { type: String },
          start: { type: String },
          text: { type: String },
        },
      ],
      translatedTranscript: [{ type: String }],
    },

    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      index: true,
    },
    playlistId: {
      type: mongoose.Types.ObjectId,
      ref: "Playlist",
    },
  },
  {
    toJSON: { virtuals: true }, // Ensure virtuals are included in JSON output
    timestamps: true,
    toObject: { virtuals: true }, // Ensure virtuals are included in object output
  }
);

// ... rest of the schema remains the same ...

VideoSchema.virtual("videoCards", {
  ref: "Card",
  localField: "_id",
  foreignField: "videoId",
  options: {
    sort: { createdAt: -1 },
    lean: true,
  },
  justOne: false, // Indicates this is a one-to-many relationship
});

const VideoModel = mongoose.model("Video", VideoSchema);

module.exports = VideoModel;
