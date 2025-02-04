const express = require("express");
const mongoose = require("mongoose");
const textSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    content: {
      type: String,
      required: true,
    },
    defaultCollection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
  },
  { timestamps: true }
);

textSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});
const textModel = mongoose.model("Text", textSchema);

module.exports = textModel;
