const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");

module.exports.createCard = async (req, res, next) => {
  const { cards, collectionId, videoId, language, sectionId } = req.body;


      let shownInHome = true;
    if (collectionId) {
      const collection = await CollectionModel.findById(collectionId);
      if (collection) {
        shownInHome = collection.showCardsInHome;
      }
    }

    
  if (Array.isArray(cards)) {
    // Bulk creation
    const cardsData = cards.map((card, index) => ({
      ...card,
      videoId,
      language,
      sectionId,
      userId: sectionId ? undefined : req.user?._id,
    }));

    // Validate all cards have front and back
    const invalidCards = cardsData.filter((card) => !card.front || !card.back);

    if (invalidCards.length > 0) {
      return res.status(400).send("All cards must have front and back content");
    }

    try {
      const createdCards = await CardModel.insertMany(cardsData);

      console.log("createdCards", createdCards);
      return res.status(200).send(createdCards);
    } catch (err) {
      console.log("error in createCards", err);
      return res.status(400).send(err);
    }
  } else {
    // Single card creation
    const { front, back, content } = req.body;
    if (!front || !back) {
      return res
        .status(400)
        .send("you have to enter the front and the back name");
    }

    const cardData = {
      front,
      back,
      content,
      collectionId,
      videoId,
      language,
      sectionId,
      userId: sectionId ? undefined : req.user._id,
      shownInHome,
    };

    try {
      const createdCard = await CardModel.create(cardData);
      return res.status(200).send(createdCard);
    } catch (err) {
      console.log("error in createCard", err);
      res.status(400).send(err);
    }
  }
};

module.exports.getUserCards = async (req, res, next) => {
  const {
    page: pageNumber,
    searchQuery,
    collectionId,
    videoId,
    study,
    language,
    sectionId,
    difficulty,
  } = req.query;

  const query = {};
  const options = {};

  if (searchQuery) {
    query.$or = [
      { front: { $regex: searchQuery, $options: "i" } },
      { back: { $regex: searchQuery, $options: "i" } },
    ];
  }

  // Add difficulty filter based on easeFactor ranges
  if (difficulty) {
    switch (difficulty) {
      case "easy":
        query.easeFactor = { $gte: 0.75 };
        break;
      case "medium":
        query.easeFactor = { $gte: 0.5, $lt: 0.75 };
        break;
      case "hard":
        query.easeFactor = { $lt: 0.5 };
        break;
    }
  }

  if (sectionId) {
    query.sectionId = sectionId;
  } else if (collectionId) {
    query.collectionId = collectionId;
  } else {
    query.shownInHome = true;
    query.userId = req.user?._id;
  }
  if (videoId) {
    query.videoId = videoId;
  }
  if (language) {
    query.language = language;
  }
  if (sectionId) {
    query.sectionId = sectionId;
  }
  if (study) {
    options.sort = { easeFactor: 1 };
  }
  const limit = 10;
  let page = +pageNumber || 0; // Default to 0 if pageNumber is not provided
  try {
    const cardsCount = await CardModel.countDocuments(query);

    const skipNumber = page * limit;
    const remaining = Math.max(0, cardsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const cards = await CardModel.find(query, {}, options)
      .skip(skipNumber)
      .limit(limit);

    res.status(200).send({ cards, nextPage, cardsCount });
  } catch (err) {
    console.log("get cards error :", err);
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
    let shownInHome = true;
    if (collectionId) {
      const collection = await CollectionModel.findById(collectionId);
      if (collection) {
        shownInHome = collection.showCardsInHome;
      }
    }

    const updatedCard = await CardModel.findByIdAndUpdate(
      { _id: req.params.id },
      {
        front,
        back,
        content,
        collectionId,
        userId: req.user?._id,
        easeFactor,
        shownInHome,
      },
      {
        new: true,
      }
    );

    res.status(200).send(updatedCard);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.batchUpdate = async (req, res, next) => {
  const { toUpdateCardsData } = req.body;
  if (!Array.isArray(toUpdateCardsData) || toUpdateCardsData.length === 0) {
    return res
      .status(400)
      .send('You must send a non-empty "toUpdateCardsData" array');
  }

  try {
    const ops = toUpdateCardsData.map((card) => ({
      updateOne: {
        filter: { _id: card._id },
        update: { $set: { easeFactor: card.easeFactor } },
      },
    }));

    const result = await CardModel.bulkWrite(ops);
    res.status(200).json({ modifiedCount: result.modifiedCount });
  } catch (err) {
    res.status(400).send("error in updating the study cards :", err);
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
  const { ids, collectionId } = req.body;

  try {
    let shownInHome = true;
    if (collectionId) {
      const collection = await CollectionModel.findById(collectionId);
      if (collection) {
        shownInHome = collection.showCardsInHome;
      }
    }

    await CardModel.updateMany(
      { _id: { $in: ids } },
      { collectionId: collectionId, shownInHome: shownInHome }
    );

    res.status(200).send({ message: "cards moved successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error moving cards" });
  }
};
