const CollectionModel = require("../models/CollectionModel");

module.exports.createCollection = async (req, res, next) => {
  const { name, public = false } = req.body;

  if (!name)
    return res.status(400).send("you have to enter the collection name");

  try {
    const createdCollection = await CollectionModel.create({
      name,
      public,
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
    const collections = await CollectionModel.find({ userId: req.user._id });
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
    const collection = await CollectionModel.find({
      _id: req.params.id,
    }).populate("collectionCards");

    res.status(200).send(collection[0]);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.updateCollection = async (req, res, next) => {
  const { name, cards, public } = req.body;
  try {
    const updateCollection = await CollectionModel.findByIdAndUpdate(
      { _id: req.params.id },
      { name, cards, public },
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
