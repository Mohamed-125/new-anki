const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
const CardModel = require("./CardModel");

const CollectionSchema = new mongoose.Schema(
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
    childCollectionsIds: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Collection",
      },
    ],
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true, lean: true }
);

CollectionSchema.index({ parentCollectionId: 1, userId: 1 });

CollectionSchema.set("toObject", { virtuals: true });
CollectionSchema.set("toJSON", { virtuals: true });

CollectionSchema.pre("find", function (next) {
  this.sort({ createdAt: -1 }); // Sort by createdAt in descending order (newest first)
  next();
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
  options: {
    sort: { createdAt: -1 }, // Sort subcollections by createdAt in descending order (newest first)
    lean: true,
    populate: {
      path: "subCollections",
      options: {
        sort: { createdAt: -1 },
        lean: true,
        projection: {
          _id: 1,
          name: 1,
          public: 1,
          parentCollectionId: 1,
        },
      },
    },
    projection: {
      _id: 1,
      name: 1,
      public: 1,
      parentCollectionId: 1,
    },
  },
});

CollectionSchema.virtual("parentCollection", {
  ref: "Collection",
  foreignField: "_id", // Foreign field of subcollections (parentCollectionId)
  localField: "parentCollectionId", // Local field of parent collection (_id)
  options: {
    sort: { createdAt: -1 }, // Sort subcollections by createdAt in descending order (newest first)
    lean: true,
    projection: {
      _id: 1,
      name: 1,
      public: 1,
      parentCollectionId: 1,
      childCollectionsIds: 1,
    },
  },
});

// CollectionSchema.pre(["save", "findByIdAndUpdate"], async function (next) {
//   const collectionModel = this.constructor;
//   const parentCollectionId = this?.parentCollectionId;

//   if (parentCollectionId) {
//     try {
//       const editedParentCollection = await collectionModel.findByIdAndUpdate(
//         { _id: parentCollectionId },
//         { childCollectionsIds: { $push: this._id } },
//         {
//           new: true,
//         }
//       );
//     } catch (err) {}
//   }

//   next();
// });

CollectionSchema.pre(["findOneAndDelete", "deleteMany"], async function (next) {
  const query = this.getQuery(); // Get the query used for deletion
  const CollectionModel = this.model; // Access model inside middleware

  if (this.op === "findOneAndDelete") {
    // Find the document before it gets deleted
    this._docToDelete = await CollectionModel.findOne(query);
  } else if (this.op === "deleteMany") {
    // Fetch all documents that match the query before deletion
    this._docsToDelete = await CollectionModel.find(query).lean();
  }

  next();
});

CollectionSchema.post(["findOneAndDelete", "deleteMany"], async function () {
  const CollectionModel = this.model;

  if (this.op === "findOneAndDelete" && this._docToDelete) {
    await CollectionModel.deleteMany({
      parentCollectionId: this._docToDelete._id,
    });
  }

  if (this.op === "deleteMany" && this._docsToDelete.length > 0) {
    const idsToDelete = this._docsToDelete.map((doc) => doc._id);
    await CollectionModel.deleteMany({
      parentCollectionId: { $in: idsToDelete },
    });
  }
});

const CollectionModel = mongoose.model("Collection", CollectionSchema);

module.exports = CollectionModel;
