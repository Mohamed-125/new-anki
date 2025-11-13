const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const nanoid = require("nanoid");
// Batch delete cards
exports.batchDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty ids array" });
    }

    // Convert string IDs to ObjectIds
    const objectIds = ids.map((id) => mongoose.Types.ObjectId(id));

    // Delete cards in batch
    const result = await CardModel.deleteMany({ _id: { $in: objectIds } });

    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} cards`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in batch delete cards:", error);
    return res
      .status(500)
      .json({ message: "Failed to delete cards", error: error.message });
  }
};

module.exports.batchUpdate = async (req, res, next) => {
  const { toUpdateCardsData } = req.body;
  if (!Array.isArray(toUpdateCardsData) || toUpdateCardsData.length === 0) {
    return res
      .status(400)
      .send('You must send a non-empty "toUpdateCardsData" array');
  }

  // Validate each card's data
  for (const card of toUpdateCardsData) {
    if (!card._id) {
      return res
        .status(400)
        .json({ error: "Each card must have an _id field" });
    }
  }

  console.log(
    "Processing batch update for cards:",
    toUpdateCardsData.map((card) => card._id)
  );

  const ops = toUpdateCardsData.map((cardData) => ({
    updateOne: {
      filter: { _id: cardData._id },
      update: {
        $set: {
          stability: cardData.stability,
          difficulty: cardData.difficulty,
          elapsed_days: cardData.elapsed_days,
          scheduled_days: cardData.scheduled_days,
          learning_steps: cardData.learning_steps,
          reps: cardData.reps,
          lapses: cardData.lapses,
          state: cardData.state,
          last_review: new Date(cardData.last_review),
          due: new Date(cardData.due),
        },
        $inc: { reviewCount: 1 },
      },
    },
  }));

  console.log("Generated update operations:", ops);
  if (ops.length === 0) return res.status(400).send("No cards to update");

  try {
    const bulkResult = await CardModel.bulkWrite(ops);
    console.log("Bulk update result:", bulkResult);
    return res.status(200).json({
      modifiedCount: bulkResult.modifiedCount,
      message: "Cards updated successfully",
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    return res.status(500).json({
      error: "Bulk update failed",
      details: err.message || err,
    });
  }
};

module.exports.createCard = async (req, res, next) => {
  const { cards, collectionId, videoId, language, sectionId, _id } = req.body;

  let showInHome = true;
  if (collectionId) {
    const collection = await CollectionModel.findById(collectionId);
    if (collection) {
      showInHome = collection.showCardsInHome;
    }
  }

  console.log("req.body", req.body);
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

    console.log("invalidCards", invalidCards);
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
      _id,
      collectionId,
      videoId,
      language,
      sectionId,
      userId: sectionId ? undefined : req.user._id,
      showInHome,
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

async function resetAllCards() {
  try {
    const now = new Date();

    // Build the reset object based on SRS.createEmptyCard
    const resetFields = {
      stability: 0,
      difficulty: 0.3,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      last_review: now,
      due: now,
    };

    // Update all cards at once
    const result = await CardModel.updateMany({}, { $set: resetFields });

    console.log(
      `All cards have been reset. Modified count: ${result.modifiedCount}`
    );
    return result;
  } catch (err) {
    console.error("Failed to reset cards:", err);
    throw err;
  }
}

// transaction-migrate-and-dedupe.js
async function migrateAndDedupeTransactional() {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1) Aggregate groups by key and find duplicates
    const groups = await CardModel.aggregate([
      {
        $project: {
          frontNorm: { $toLower: { $trim: { input: "$front" } } },
          backNorm: { $toLower: { $trim: { input: "$back" } } },
          userId: 1,
          createdAt: 1,
          _id: 1,
        },
      },
      {
        $group: {
          _id: { userId: "$userId", front: "$frontNorm", back: "$backNorm" },
          docs: { $push: { id: "$_id", createdAt: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]).session(session);

    console.log(`Found ${groups.length} duplicate groups.`);

    // 2) For each group: choose canonical doc to keep, delete others
    for (const g of groups) {
      // Prefer to keep any doc that already has string _id (i.e., type string),
      // otherwise keep the earliest createdAt doc.
      const docIds = g.docs.map((d) => d.id);
      // fetch full documents for these ids (in session)
      const docs = await CardModel.find({ _id: { $in: docIds } }).session(
        session
      );

      // try prefer existing string _id (type string)
      let keepDoc = docs.find((d) => typeof d._id === "string");
      if (!keepDoc) {
        // keep earliest createdAt
        keepDoc = docs.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));
      }

      const keepId = keepDoc._id.toString();
      const deleteIds = docs
        .filter((d) => d._id.toString() !== keepId)
        .map((d) => d._id);

      if (deleteIds.length) {
        await CardModel.deleteMany({ _id: { $in: deleteIds } }).session(
          session
        );
        console.log(
          `Group ${JSON.stringify(g._id)}: kept ${keepId}, deleted ${
            deleteIds.length
          }`
        );
      }
    }

    // 3) Migrate remaining ObjectId _id docs (non-duplicates now)
    const toMigrate = await CardModel.find({
      _id: { $type: "objectId" },
    }).session(session);
    console.log(`After dedupe, migrating ${toMigrate.length} docs.`);

    for (const card of toMigrate) {
      const key = {
        userId: card.userId ? card.userId.toString() : null,
        frontNorm: card.front.trim().toLowerCase(),
        backNorm: card.back.trim().toLowerCase(),
      };

      // ensure there is no existing doc in DB (string id) for this key
      const existing = await CardModel.findOne({
        userId: card.userId,
        $expr: {
          $and: [
            {
              $eq: [
                { $toLower: { $trim: { input: "$front" } } },
                key.frontNorm,
              ],
            },
            {
              $eq: [{ $toLower: { $trim: { input: "$back" } } }, key.backNorm],
            },
          ],
        },
      }).session(session);

      if (existing) {
        // duplicate exists (kept during dedupe) → delete current ObjectId card
        await CardModel.deleteOne({ _id: card._id }).session(session);
        console.log(
          `Deleted ObjectId doc ${card._id} because duplicate exists ${existing._id}`
        );
        continue;
      }

      // insert new with new string _id
      const newCardObj = card.toObject();
      delete newCardObj._id;
      const newId = nanoid();
      await CardModel.create([{ ...newCardObj, _id: newId }], { session });
      // remove old
      await CardModel.deleteOne({ _id: card._id }).session(session);
      console.log(`Migrated ${card._id} -> ${newId}`);
    }

    await session.commitTransaction();
    console.log("Transaction committed: migration + dedupe finished.");
  } catch (err) {
    await session.abortTransaction();
    console.error("Transaction aborted due to error:", err);
  } finally {
    session.endSession();
  }
}

async function renameShownInHome() {
  try {
    // Update all documents that have "shownInHome" field
    const result = await CardModel.updateMany(
      { shownInHome: { $exists: true } },
      [
        {
          $set: { showInHome: "$shownInHome" }, // copy the value to new field
        },
        {
          $unset: "shownInHome", // remove the old field
        },
      ]
    );

    console.log(
      `Migration complete: ${result.modifiedCount} documents updated`
    );
  } catch (err) {
    console.error("Migration error:", err);
  }
}

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
  // migrateAndDedupeTransactional();

  const query = {};
  const options = {};
  // renameShownInHome();

  if (searchQuery) {
    query.$or = [
      { front: { $regex: searchQuery.trim(), $options: "i" } },
      { back: { $regex: searchQuery.trim(), $options: "i" } },
    ];
  }

  // Add difficulty filter based on easeFactor ranges
  if (difficulty) {
    switch (difficulty) {
      case "easy":
        query.difficulty = { $gte: 0.7 };
        break;
      case "medium":
        query.difficulty = { $gte: 0.5, $lt: 0.7 };
        break;
      case "hard":
        query.difficulty = { $lt: 0.5 };
        break;
    }
  }

  if (sectionId) {
    query.sectionId = sectionId;
  } else if (collectionId) {
    query.collectionId = collectionId;
  } else {
    query.showInHome = true;
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
    console.log("sort", study);
    // 1. الترتيب يكون دائمًا حسب الأقدم استحقاقًا
    options.sort = { state:1, due: 1, createdAt: 1, difficulty: 1, _id: 1 };

    // 2. تطبيق منطق الجدولة بناءً على قيمة study
    switch (study.toLowerCase()) {
      case "today":
        // حساب نهاية اليوم الحالي (لتضمين جميع البطاقات المستحقة اليوم)
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999); // 11:59:59 PM

        // إرجاع البطاقات المستحقة (due) اليوم أو قبله
        query.due = { $lte: endOfToday };
        break;

      case "all":
        // لا نضيف أي فلتر على 'due'، وبالتالي سيتم إرجاع جميع البطاقات.
        // يمكننا إضافة فلتر وهمي إذا أردنا الترتيب فقط:
        // query.userId = req.user?._id; // يجب أن تكون موجودة بالفعل في منطق 'else' أدناه
        break;
    }
  } else {
    options.sort = {
      createdAt: -1,
      // _id: 1
    };
  }

  const limit = 30; // Increased limit for better performance
  let page = +pageNumber || 0; // Default to 0 if pageNumber is not provided
  try {
    const cardsCount = await CardModel.countDocuments(query);

    const skipNumber = page * limit;
    const remaining = Math.max(0, cardsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;
    const cards = await CardModel.find(query, {}, options)
      .skip(skipNumber)
      .limit(limit)
      .lean();

    console.log("query", query);
    console.log("cards", cards);
    res.status(200).send({
      //  allCards,
      cards,
      nextPage,
      cardsCount,
    });
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
    let showInHome = true;
    if (collectionId) {
      const collection = await CollectionModel.findById(collectionId);
      if (collection) {
        showInHome = collection.showCardsInHome;
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
        showInHome,
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

module.exports.deleteCard = async (req, res, next) => {
  try {
    const deletedCard = await CardModel.findByIdAndDelete({
      _id: req.params.id,
    });

    if (!deletedCard)
      return res
        .status(400)
        .send("there is no card with this id: " + req.params.id);
    return res.status(200).send("deleted!!");
  } catch (err) {
    return res.status(400).send(err);
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
    let showInHome = true;
    if (collectionId) {
      const collection = await CollectionModel.findById(collectionId);
      if (collection) {
        showInHome = collection.showCardsInHome;
      }
    }

    await CardModel.updateMany(
      { _id: { $in: ids } },
      { collectionId: collectionId, showInHome: showInHome }
    );

    res.status(200).send({ message: "cards moved successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error moving cards" });
  }
};
