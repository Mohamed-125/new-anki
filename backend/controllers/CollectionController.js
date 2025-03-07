const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");
const { getUserCards } = require("./CardController");

module.exports.createCollection = async (req, res, next) => {
  const { name, public = false, parentCollectionId } = req.body;

  if (!name)
    return res.status(400).send("you have to enter the collection name");

  try {
    const createdCollection = await CollectionModel.create({
      name,
      public,
      parentCollectionId,
      userId: req.user?._id,
    });
    res.status(200).send(createdCollection);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.forkCollection = async (req, res, next) => {
  const collectionId = req.params.id;

  if (!collectionId)
    return res
      .status(400)
      .send("you have to send the collection id to fork it");

  try {
    const originalCollection = await CollectionModel.findOne({
      _id: collectionId,
    });
    const clonedData = originalCollection.toObject();

    clonedData.userId = req.user?._id;
    clonedData.public = false;
    delete clonedData._id;

    const newCollection = await CollectionModel.create(clonedData);

    res.status(200).send({ newCollection, originalCollection });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getCollections = async (req, res, next) => {
  const { searchQuery, public, page = 0 } = req.query;
  const limit = 10; // Number of items per page
  const query = {};

  if (!public) {
    query.userId = req.user?._id;
    if (searchQuery) query.name = { $regex: searchQuery, $options: "i" };
  } else {
    query.public = true;
  }

  try {
    // Get total count for pagination
    const totalCount = await CollectionModel.countDocuments(query);

    // Get paginated collections
    const collections = await CollectionModel.find(query)
      .skip(page * limit)
      .limit(limit);

    const subCollections = collections?.filter(
      (collection) => collection.parentCollectionId
    );

    const notParentCollections = collections?.filter(
      (collection) => !collection.parentCollectionId
    );

    const parentCollections =
      collections.find((parentCollection) =>
        subCollections?.some(
          (subCollection) =>
            subCollection.parentCollectionId === parentCollection._id
        )
      ) ?? [];

    // Calculate if there's a next page
    const nextPage = (page + 1) * limit < totalCount ? Number(page) + 1 : null;

    res.status(200).send({
      collections,
      subCollections,
      parentCollections,
      notParentCollections,
      nextPage,
      totalCount,
    });
  } catch (err) {
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
    console.log("", err);
    res.status(400).send(err);
  }
};
module.exports.updateCollection = async (req, res, next) => {
  const { name, cards, public, parentCollectionId } = req.body;

  console.log(req.body);
  try {
    const updateCollection = await CollectionModel.findByIdAndUpdate(
      { _id: req.params.id },
      { name, cards, public, parentCollectionId },
      {
        new: true,
      }
    );
    res.status(200).send(updateCollection);
  } catch (err) {
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
