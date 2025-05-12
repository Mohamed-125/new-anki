const mongoose = require("mongoose");

const userVideoSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", index: true },
  videoId: { type: mongoose.Types.ObjectId, ref: "Video" },
  playlistId: { type: mongoose.Types.ObjectId, ref: "Playlist" },
  addedAt: { type: Date, default: Date.now },
});

const UserVideoModel = mongoose.model("UserVideo", userVideoSchema);

exports.default = UserVideoModel;
