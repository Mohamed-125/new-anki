const express = require("express");
const mongoose = require("mongoose");
const textSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  content: {
    type: String,
    required: true,
  },
});

const textModel = mongoose.model("Text", textSchema);

module.exports = textModel;
