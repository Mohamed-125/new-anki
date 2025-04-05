const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      require: [true, "url is required"],
    },
    title: {
      type: String,
      index: true,
    },
    thumbnail: {
      type: String,
    },

    defaultCaptionData: {
      name: { type: String },
      transcript: [
        {
          offset: { type: Number },
          duration: { type: Number },
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
    listId: { type: String, index: true },
    lessonId: { type: String, index: true },
    topicOrder: {
      type: Number,
      default: 0,
    },
    topicId: {
      type: mongoose.Types.ObjectId,
      index: true,
      ref: "Topic",
    },
    playlistId: {
      type: mongoose.Types.ObjectId,
      index: true,
      ref: "Playlist",
    },
    language: {
      type: String,
      index: true,
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
