const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema(
  {
    _id: String, // allow custom string IDs

    // ------------------- Core fields -------------------
    front: {
      type: String,
      required: [true, "front is required"],
      index: true,
    },
    back: {
      type: String,
      required: [true, "back is required"],
      index: true,
    },
    content: {
      type: String,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      index: true,
    },
    videoId: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
      index: true,
    },

    // ------------------- FSRS / Anki fields -------------------
    stability: { type: Number, default: 0 }, // إزالة min
    difficulty: { type: Number, default: 0 }, // إزالة min & max
    elapsed_days: { type: Number, default: 0 },
    scheduled_days: { type: Number, default: 0 },
    learning_steps: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    lapses: { type: Number, default: 0 },
    state: {
      type: Number,
      enum: [0, 1, 2, 3], // 0 = NEW, 1 = LEARNING, 2 = REVIEW, 3 = RELEARNING
      default: 0,
    },
    due: { type: Date, default: Date.now }, // لازم يكون موجود
    last_review: { type: Date, default: Date.now }, // لازم يكون موجود
    // ------------------- Legacy / Frontend fields -------------------
    collectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
      index: true,
    },
    language: {
      type: String,
      index: true,
    },
    sectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Section",
      index: true,
    },
    showInHome: { type: Boolean, default: true, index: true },

    // ------------------- Stats -------------------
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// CardSchema.pre("find", function (next) {
//   this.sort({ createdAt: -1 });
//   next();
// });

const CardModel = mongoose.model("Card", CardSchema);
module.exports = CardModel;
