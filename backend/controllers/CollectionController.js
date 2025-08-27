const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");
const { getUserCards } = require("./CardController");

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
  const limit = 10; // Number of items per page
  const query = {};

  // // Update collections without showCardsInHome field
  // const updatedCollections = await CollectionModel.updateMany(
  //   { showCardsInHome: { $exists: false } },
  //   { $set: { showCardsInHome: true } }
  // );

  // // Update cards without shownInHome field
  // const updatedCards = await CardModel.updateMany(
  //   { shownInHome: { $exists: false } },
  //   { $set: { shownInHome: true } }
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
        .lean();
    } else {
      collections = await CollectionModel.find(query)
        .skip(page * limit)
        .limit(limit)
        .lean();
    }
    const remaining = collectionsCount - (page + 1) * limit;

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
    const collections = await CollectionModel.find();
    res.status(200).send(collections);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getCollection = async (req, res, next) => {
  try {
    let collection = await CollectionModel.findOne({
      _id: req.params.id,
    })
      .populate("subCollections")
      .lean();

    res.status(200).send(collection);
  } catch (err) {
    console.log("collection err : ", err);
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
        { shownInHome: showCardsInHome }
      );
    }

    res.status(200).send(updatedCollection);
  } catch (err) {
    console.error("Update collection error:", err);
    res.status(400).send(err);
  }
};
module.exports.deleteCollection = async (req, res, next) => {
  try {
    const deletedCollection = await CollectionModel.findOneAndDelete({
      _id: req.params.id,
    });
    res.status(200).send("deleted!!");
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.batchDelete = async (req, res) => {
  const { ids } = req.body;

  try {
    // Assuming you're using a database model like `Video`
    await CollectionModel.deleteMany({ _id: { $in: ids } });
    res.status(200).send({ message: "collections deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting collections" });
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
