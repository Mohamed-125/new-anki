const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const NoteSchema = new Schema(
  {
    title: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    content: { type: String, required: true },
    language: { type: String, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: "Section", index: true },
  },
  { timestamps: true, lean: true }
);

NoteSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});

const NoteModel = mongoose.model("Note", NoteSchema);
module.exports = NoteModel;
