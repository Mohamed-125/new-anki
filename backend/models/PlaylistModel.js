const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const VideoModel = require("./VideoModel");

const PlaylistSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "Playlist name is required"],
    },
    slug: {
      type: String,
    },
    // playlistVideos: [
    //   {
    //     type: mongoose.Types.ObjectId,
    //     ref: "Video",
    //     default: [],
    //   },
    // ],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    language: {
      type: String,
      index: true,
    },
  },
  { timestamps: true }
);

PlaylistSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});
PlaylistSchema.set("toObject", { virtuals: true });
PlaylistSchema.set("toJSON", { virtuals: true });

// PlaylistSchema.post(["find", "findOne"], async function (docs) {
//   if (Array.isArray(docs)) {
//     // If docs is an array (find)
//     for (let doc of docs) {
//       const cardsBelongsToThisCollection = await VideoModel.find({
//         collectionId: doc._id,
//       });

//       // Log and update the document
//       doc.collectionCards = [
//         ...doc.collectionCards,
//         ...cardsBelongsToThisCollection,
//       ];
//     }
//   } else if (docs) {
//     // If docs is a single document (findOne)
//     const cardsBelongsToThisCollection = await VideoModel.find({
//       collectionId: docs._id,
//     });

//     // Log and update the document
//     (docs.collectionCards, docs.name);
//     docs.collectionCards = [
//       ...docs.collectionCards,
//       ...cardsBelongsToThisCollection,
//     ];
//   }
// });

PlaylistSchema.virtual("playlistVideos", {
  ref: "Video",
  localField: "_id",
  foreignField: "playlistId",
});

const PlaylistModel = mongoose.model("Playlist", PlaylistSchema);
module.exports = PlaylistModel;
