const express = require("express");
const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const NoteSchema = new Schema({
  title: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
});

const NoteModel = mongoose.model("Note", NoteSchema);
module.exports = NoteModel;
