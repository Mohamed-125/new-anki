const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const CardModel = require("./CardModel");

const CollectionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "collection name is required"],
    },
    slug: {
      type: String,
    },
    public: {
      type: Boolean,
    },
    parentCollectionId: {
      type: mongoose.Types.ObjectId,
      ref: "Collection",
    },
    collectionCards: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Card",
        default: [],
      },
    ],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

CollectionSchema.set("toObject", { virtuals: true });
CollectionSchema.set("toJSON", { virtuals: true });

CollectionSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
});

CollectionSchema.post(["find", "findOne"], async function (docs) {
  if (Array.isArray(docs)) {
    // If docs is an array (find)
    for (let doc of docs) {
      const cardsBelongsToThisCollection = await CardModel.find({
        collectionId: doc._id,
      });

      // Log and update the document
      doc.collectionCards = [
        ...doc.collectionCards,
        ...cardsBelongsToThisCollection,
      ];
    }
  } else if (docs) {
    // If docs is a single document (findOne)
    const cardsBelongsToThisCollection = await CardModel.find({
      collectionId: docs._id,
    });

    // Log and update the document
    docs.collectionCards, docs.name;
    docs.collectionCards = [
      ...docs.collectionCards,
      ...cardsBelongsToThisCollection,
    ];
  }
});

CollectionSchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});

CollectionSchema.set("toObject", { virtuals: true });
CollectionSchema.set("toJSON", { virtuals: true });

CollectionSchema.virtual("subCollections", {
  ref: "Collection",
  foreignField: "parentCollectionId", // Foreign field of subcollections (parentCollectionId)
  localField: "_id", // Local field of parent collection (_id)
});

const CollectionModel = mongoose.model("Collection", CollectionSchema);

module.exports = CollectionModel;
