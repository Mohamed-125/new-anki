const CardModel = require("../models/CardModel");

module.exports.createCard = async (req, res, next) => {
  const { word, translation, examples, collectionId, videoId } = req.body;

  if (!word || !translation)
    return res
      .status(400)
      .send("you have to enter the word and the translation name");

  try {
    const createdCard = await CardModel.create({
      word,
      translation,
      examples,
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
  try {
    const cards = await CardModel.find({ userId: req.user._id });
    res.status(200).send(cards);
  } catch (err) {
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
  const { word, translation, examples, collectionId } = req.body;

  console.log("body", req.body);
  try {
    const updatedCard = await CardModel.findByIdAndUpdate(
      { _id: req.params.id },
      { word, translation, examples, collectionId, userId: req.user._id },
      {
        new: true,
      }
    );

    console.log("updatedCard", updatedCard);
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
