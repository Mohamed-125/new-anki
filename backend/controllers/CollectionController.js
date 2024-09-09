const CollectionModel = require("../models/CollectionModel");

module.exports.createCollection = async (req, res, next) => {
  const { name } = req.body;

  if (!name)
    return res.status(400).send("you have to enter the collection name");

  try {
    const createdCollection = await CollectionModel.create({
      name,
      userId: req.user._id,
    });
    res.status(200).send(createdCollection);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getCollections = async (req, res, next) => {
  try {
    const collections = await CollectionModel.find({ userId: req.user._id });
    console.log(collections);
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
  const { name, cards } = req.body;
  try {
    const updateCollection = await CollectionModel.findByIdAndUpdate(
      { _id: req.params.id },
      { name, cards },
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
