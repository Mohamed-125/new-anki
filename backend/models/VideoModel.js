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

    translatedTranscript: [
      {
        type: String,
      },
    ],
    availableCaptions: [
      {
        id: String,
        language: String,
        name: String,
        isAutoGenerated: Boolean,
      },
    ],
    defaultCaptionData: {
      name: { type: String },
      transcript: [
        {
          dur: { type: String, required: true },
          start: { type: String, required: true },
          text: { type: String, required: true },
        },
      ],
      translatedTranscript: [{ type: String, required: true }],
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

// Ensure proper population behavior
VideoSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    return ret;
  },
});

VideoSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    return ret;
  },
});

const VideoModel = mongoose.model("Video", VideoSchema);

module.exports = VideoModel;
