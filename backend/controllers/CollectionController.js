const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");
const { getUserCards } = require("./CardController");
const mongoose = require("mongoose");

// Batch delete collections
module.exports.batchDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty ids array" });
    }

    // Convert string IDs to ObjectIds
    const objectIds = ids.map((id) => mongoose.Types.ObjectId(id));

    // Delete collections in batch
    const result = await CollectionModel.deleteMany({
      _id: { $in: objectIds },
    });

    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} collections`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in batch delete collections:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete collections", error: error.message });
  }
};

module.exports.createCollection = async (req, res, next) => {
  const {
    name,
    public = false,
    parentCollectionId,
    language,
    sectionId,
    showCardsInHome = true,
  } = req.body;

  if (!name)
    return res.status(400).send("you have to enter the collection name");

  try {
    const collectionData = {
      name,
      public,
      parentCollectionId,
      language,
      sectionId,
      showCardsInHome,
      userId: sectionId ? undefined : req.user?._id,
    };

    const createdCollection = await CollectionModel.create(collectionData);
    res.status(200).send(createdCollection);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.forkCollection = async (req, res) => {
  const mongoose = require("mongoose");
  const originalCollectionId = req.params.id;
  const userId = req.user?._id;

  try {
    const originalCollection = await CollectionModel.findById(
      originalCollectionId
    )
      .populate({
        path: "subCollections",
        populate: {
          path: "subCollections",
        },
      })
      .exec();

    if (!originalCollection) {
      return res.status(404).send("Collection not found");
    }

    // Internal helper function to recursively fork collections
    const forkCollectionHelper = async (
      collection,
      userId,
      parentId = null
    ) => {
      // Create a new collection
      const newCollection = new CollectionModel({
        name: collection.name,
        slug: collection.slug,
        public: false,
        userId: userId,
        language: collection.language,
        forkedFrom: collection._id,
        parentCollectionId: parentId,
        showCardsInHome: true,
      });

      await newCollection.save();

      // Copy all cards from the original collection
      const originalCards = await CardModel.find({
        collectionId: collection._id,
      }).lean();

      const cardPromises = originalCards.map((card) => {
        const newCard = new CardModel({
          ...card,
          easeFactor: 0,
          easeFactorDate: Date.now(),
          sectionId: null,
          _id: new mongoose.Types.ObjectId(),
          userId: userId,
          collectionId: newCollection._id,
        });
        return newCard.save();
      });

      try {
        await Promise.all(cardPromises);
      } catch (err) {
        console.log("forking card err : ", err);
      }

      // Recursively fork subcollections
      if (collection.subCollections && collection.subCollections.length > 0) {
        const subCollectionPromises = collection.subCollections.map(
          (childCollection) =>
            forkCollectionHelper(childCollection, userId, newCollection._id)
        );

        try {
          await Promise.all(subCollectionPromises);
        } catch (err) {
          console.log("forking subCollection err : ", err);
        }
      }

      return newCollection;
    };

    // Start the forking process with the original collection
    const forkedCollection = await forkCollectionHelper(
      originalCollection,
      userId
    );
    res.send(forkedCollection);
  } catch (err) {
    console.log("fork collection err:", err);
    res.status(500).send({ error: "Error forking collection" });
  }
};

module.exports.getCollections = async (req, res, next) => {
  let { sectionId, searchQuery, public, page = 0, all, language } = req.query;
  const limit = 30; // Increased number of items per page for better performance
  const query = {};

  // // Update collections without showCardsInHome field
  // const updatedCollections = await CollectionModel.updateMany(
  //   { showCardsInHome: { $exists: false } },
  //   { $set: { showCardsInHome: true } }
  // );

  // // Update cards without showInHome field
  // const updatedCards = await CardModel.updateMany(
  //   { showInHome: { $exists: false } },
  //   { $set: { showInHome: true } }
  // );

  page = +page;

  if (language) query.language = language;
  if (sectionId) {
    query.sectionId = sectionId;
  } else if (!public) {
    query.userId = req.user?._id;
  } else {
    query.public = true;
  }
  query.$or = [
    { parentCollectionId: { $exists: false } },
    { parentCollectionId: null },
  ];

  if (searchQuery) query.name = { $regex: searchQuery, $options: "i" };
  if (language) query.language = language;

  try {
    // Get total count for pagination
    const collectionsCount = await CollectionModel.countDocuments(query);

    // Get paginated collections
    let collections;
    if (all === "true") {
      collections = await CollectionModel.find(query)
        .skip(page * limit)
        .limit(limit)
        .populate("subCollections")
        .lean()
        .populate("cardsCount");
    } else {
      collections = await CollectionModel.find(query)
        .skip(page * limit)
        .limit(limit)
        .lean()
        .populate("cardsCount");
    }
    const remaining = Math.max(0, collectionsCount - limit * (page + 1));

    const nextPage = remaining > 0 ? page + 1 : null;

    res.status(200).send({
      collections,
      nextPage,
      collectionsCount,
    });
  } catch (err) {
    console.log("get collections err:", err);
    res.status(400).send(err);
  }
};

module.exports.getPublicCollections = async (req, res, next) => {
  try {
    const collections = await CollectionModel.find().populate("cardsCount");
    res.status(200).send(collections);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getCollection = async (req, res, next) => {
  const { id } = req.params;

  try {
    const collection = await CollectionModel.findById(id)
      // ✅ Include cardsCount for the main collection
      .populate("cardsCount")
      // ✅ Populate first-level subcollections + their cardsCount
      .populate({
        path: "subCollections",
        populate: { path: "cardsCount" },
      })
      // ✅ Needed to make virtuals like cardsCount appear
      .lean({ virtuals: true });

    if (!collection) {
      return res.status(404).send("Collection not found");
    }

    res.status(200).send(collection);
  } catch (err) {
    console.error("collection err:", err);
    res.status(400).send(err);
  }
};

module.exports.updateCollection = async (req, res, next) => {
  const { name, cards, public, parentCollectionId, showCardsInHome } = req.body;

  try {
    // Update the collection
    const updatedCollection = await CollectionModel.findByIdAndUpdate(
      { _id: req.params.id },
      { name, cards, public, parentCollectionId, showCardsInHome },
      { new: true }
    );

    // If showCardsInHome was changed, update all cards in this collection
    if (showCardsInHome !== undefined) {
      await CardModel.updateMany(
        { collectionId: req.params.id },
        { showInHome: showCardsInHome }
      );
    }

    res.status(200).send(updatedCollection);
  } catch (err) {
    console.error("Update collection error:", err);
    res.status(400).send(err);
  }
};
module.exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteCards } = req.body;
    const collection = await CollectionModel.findById(id);
    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }
    if (deleteCards) {
      // Delete all cards in this collection
      await CardModel.deleteMany({ collectionId: id });
    } else {
      if (!collection.showCardsInHome) {
        // Keep cards, but ensure all are visible in home
        await CardModel.updateMany(
          { collectionId: id, showInHome: false },
          { $set: { showInHome: true } }
        );
      }
    }
    await CollectionModel.findByIdAndDelete(id);
    res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.batchDelete = async (req, res) => {
  const { ids } = req.body; // array of collection IDs

  try {
    // Fetch all collections to be deleted
    const collections = await CollectionModel.find({ _id: { $in: ids } });

    if (!collections.length) {
      return res.status(404).json({ message: "No collections found" });
    }

    // Iterate collections to handle cards before deletion
    for (const collection of collections) {
      if (collection.showCardsInHome === false) {
        // If cards are only visible in collection, delete them
        await CardModel.deleteMany({ collectionId: collection._id });
      } else {
        // Keep cards but ensure they appear in home
        await CardModel.updateMany(
          { collectionId: collection._id, showInHome: false },
          { $set: { showInHome: true } }
        );
      }
    }

    // Delete the collections themselves
    await CollectionModel.deleteMany({ _id: { $in: ids } });

    // Delete associations to child collections (handled in pre/post middleware)
    // The existing pre/post middleware in your CollectionSchema will cascade deletion to subcollections

    res.status(200).json({ message: "Collections deleted successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting collections", error: error.message });
  }
};

module.exports.getAllCollectionCards = async (req, res) => {
  const { id } = req.params;

  try {
    const cards = await CardModel.find({ collectionId: id }).lean();
    res.status(200).send(cards);
  } catch (err) {
    console.error("Error getting all collection cards:", err);
    res.status(500).send({ error: "Error fetching collection cards" });
  }
};
