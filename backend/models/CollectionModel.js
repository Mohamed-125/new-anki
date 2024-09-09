const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const CardModel = require("./CardModel");

const CollectionSchema = mongoose.Schema({
  name: {
    type: String,
    require: [true, "collection name is required"],
  },
  slug: {
    type: String,
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
});

CollectionSchema.set("toObject", { virtuals: true });
CollectionSchema.set("toJSON", { virtuals: true });

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
    console.log(docs.collectionCards, docs.name);
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

const CollectionModel = mongoose.model("Collection", CollectionSchema);
module.exports = CollectionModel;
