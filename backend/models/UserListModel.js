const mongoose = require("mongoose");

const userListSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", index: true },
  listId: { type: mongoose.Types.ObjectId, ref: "List", index: true },
  lastAccessedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 }, // Percentage of videos watched in the list
  completedVideos: [{ type: mongoose.Types.ObjectId, ref: "Video" }], // Array of completed video IDs
  completedTexts: [{ type: mongoose.Types.ObjectId, ref: "Text" }], // Array of completed video IDs
});

const UserListModel = mongoose.model("UserList", userListSchema);

module.exports = UserListModel;
