const mongoose = require("mongoose");

const wordsMissingSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate entries for the same word in the same language
wordsMissingSchema.index({ word: 1, language: 1 }, { unique: true });

module.exports = mongoose.model("WordsMissing", wordsMissingSchema);
