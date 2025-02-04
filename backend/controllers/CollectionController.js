const CollectionModel = require("../models/CollectionModel");

module.exports.createCollection = async (req, res, next) => {
  const { name, public = false, parentCollectionId } = req.body;

  if (!name)
    return res.status(400).send("you have to enter the collection name");

  try {
    const createdCollection = await CollectionModel.create({
      name,
      public,
      parentCollectionId,
      userId: req.user._id,
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

    clonedData.userId = req.user._id;
    clonedData.public = false;
    delete clonedData._id;

    const newCollection = await CollectionModel.create(clonedData);

    res.status(200).send({ newCollection, originalCollection });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getCollections = async (req, res, next) => {
  try {
    const collections = await CollectionModel.find({
      userId: req.user._id,
      // $or: [
      //   { parentCollectionId: { $exists: false } }, // parentCollectionId doesn't exist
      //   { parentCollectionId: null }, // parentCollectionId is null
      // ],
    });
    res.status(200).send(collections);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.getPublicCollections = async (req, res, next) => {
  try {
    const collections = await CollectionModel.find({ public: true });
    res.status(200).send(collections);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getCollection = async (req, res, next) => {
  try {
    const collection = await CollectionModel.findOne({
      _id: req.params.id,
    }).populate("subCollections");

    const subCollections = await CollectionModel.find({
      parentCollectionId: collection._id,
    });

    collection.subCollections = subCollections; // Manually assign subCollections

    console.log(collection);
    res.status(200).send(collection);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.updateCollection = async (req, res, next) => {
  const { name, cards, public, parentCollectionId } = req.body;
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
    const deletedTodo = await CollectionModel.findByIdAndDelete({
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
