const express = require("express");
const mongoose = require("mongoose");
const textSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    content: {
      type: String,
      required: true,
    },
    defaultCollectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
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
    image: {
      type: String,
    },
    language: {
      type: String,
      index: true,
    },
  },
  { timestamps: true, lean: true }
);

textSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});

const textModel = mongoose.model("Text", textSchema);

module.exports = textModel;
