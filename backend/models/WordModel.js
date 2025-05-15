const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  lemma: {
    type: String,
    required: true,
    index: true,
  },
  base: {
    singular: {
      type: String,
      required: true,
      index: true,
    },
    plural: {
      type: String,
      required: true,
      index: true,
    },
  },
  translations: {
    en: [String],
    ar: [String],
  },
  variants: {
    type: [String],
    index: true,
  },
  language: {
    default: "de",
    type: String,
  },
});

// Create indexes for efficient lookups
wordSchema.index({ "translations.english": 1 });
wordSchema.index({ "translations.arabic": 1 });

module.exports = mongoose.model("Word", wordSchema);
