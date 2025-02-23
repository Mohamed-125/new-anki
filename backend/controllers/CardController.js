const CardModel = require("../models/CardModel");

module.exports.createCard = async (req, res, next) => {
  const { front, back, content, collectionId, videoId } = req.body;

  if (!front || !back)
    return res
      .status(400)
      .send("you have to enter the front and the back name");

  try {
    const createdCard = await CardModel.create({
      front,
      back,
      content,
      collectionId,
      userId: req.user._id,
      videoId,
    });
    res.status(200).send(createdCard);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getUserCards = async (req, res, next) => {
  const { page: pageNumber, searchQuery, collectionId, videoId } = req.query;

  const query = { userId: req.user?._id };

  if (searchQuery) {
    query.$or = [
      { front: { $regex: searchQuery, $options: "i" } },
      { back: { $regex: searchQuery, $options: "i" } },
    ];
  }

  if (collectionId) {
    query.collectionId = collectionId;
  }
  if (videoId) {
    query.videoId = videoId;
  }

  const limit = 30;
  let page = +pageNumber || 0; // Default to 0 if pageNumber is not provided
  try {
    const cardsCount = await CardModel.countDocuments(query);

    console.log(cardsCount);
    const skipNumber = page * limit;
    const remaining = Math.max(0, cardsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const cards = await CardModel.find(query).skip(skipNumber).limit(limit);

    res.status(200).send({ cards, nextPage, cardsCount: cardsCount });
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

module.exports.getCard = async (req, res, next) => {
  try {
    const card = await CardModel.find({ _id: req.params.id });
    res.status(200).send(card);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.updateCard = async (req, res, next) => {
  const { front, back, content, collectionId, easeFactor } = req.body;

  try {
    const updatedCard = await CardModel.findByIdAndUpdate(
      { _id: req.params.id },
      { front, back, content, collectionId, userId: req.user._id, easeFactor },
      {
        new: true,
      }
    );

    res.status(200).send(updatedCard);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.deleteCard = async (req, res, next) => {
  try {
    const deletedTodo = await CardModel.findByIdAndDelete({
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
    await CardModel.deleteMany({ _id: { $in: ids } });
    res.status(200).send({ message: "cards deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting cards" });
  }
};

module.exports.batchMove = async (req, res) => {
  const { ids, selectedParent } = req.body;

  "ids", ids, selectedParent;
  try {
    await CardModel.updateMany(
      { _id: { $in: ids } },
      { collectionId: selectedParent }
    );

    res.status(200).send({ message: "cards moved successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error moving cards" });
  }
};
