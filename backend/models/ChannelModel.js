const mongoose = require("mongoose");

const ChannelSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    url: String,
    thumbnail: String,
    topicId: {
      type: mongoose.Types.ObjectId,
      ref: "Topic",
    },
    topicOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Channel = mongoose.model("Channel", ChannelSchema);
module.exports = Channel;
