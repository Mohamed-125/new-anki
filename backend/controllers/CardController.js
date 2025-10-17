const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");

// Custom SRS implementation to replace ts-fsrs
const SRS = {
  // Learning states
  States: {
    NEW: 0,
    LEARNING: 1,
    REVIEW: 2,
    RELEARNING: 3,
  },

  // Rating values (similar to Anki/FSRS)
  Rating: {
    Again: 1,
    Hard: 2,
    Good: 3,
    Easy: 4,
  },

  // Create a new card or reset an existing one
  createEmptyCard: function (lastReviewDate = new Date()) {
    return {
      stability: 0,
      difficulty: 0.3, // Default medium difficulty
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: this.States.NEW,
      last_review: lastReviewDate,
      due: lastReviewDate,
    };
  },

  // Main algorithm for calculating intervals
  calculateNextInterval: function (card, rating) {
    // Clone the card to avoid modifying the original
    const updatedCard = { ...card };

    // Update review count
    updatedCard.reps += 1;

    // Current date for calculations
    const now = new Date();

    // Calculate days elapsed since last review
    const daysSinceLastReview = Math.max(
      0,
      Math.floor(
        (now - new Date(updatedCard.last_review)) / (1000 * 60 * 60 * 24)
      )
    );
    updatedCard.elapsed_days = daysSinceLastReview;

    // Update last review date
    updatedCard.last_review = now;

    // Handle different states and ratings
    switch (updatedCard.state) {
      case this.States.NEW:
        return this._handleNewCard(updatedCard, rating);

      case this.States.LEARNING:
        return this._handleLearningCard(updatedCard, rating);

      case this.States.REVIEW:
        return this._handleReviewCard(updatedCard, rating);

      case this.States.RELEARNING:
        return this._handleRelearningCard(updatedCard, rating);

      default:
        return this._handleNewCard(updatedCard, rating);
    }
  },
 // Handle new cards
_handleNewCard: function (card, rating) {
  switch (rating) {
    case this.Rating.Again:
      // Failed, stay in learning with short interval
      card.learning_steps = 0;
      card.due = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      break;

    case this.Rating.Hard:
      // Move to learning with short interval
      card.state = this.States.LEARNING;
      card.learning_steps = 1;
      card.due = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      break;

    case this.Rating.Good:
      // Move to learning with medium interval
      card.state = this.States.LEARNING;
      card.learning_steps = 1;
      card.due = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      break;

    case this.Rating.Easy:
      // Light learning instead of direct review
      card.state = this.States.LEARNING;
      card.learning_steps = 2;
      card.due = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours
      break;
  }

  return card;
},

// Handle cards in learning phase
_handleLearningCard: function (card, rating) {
  switch (rating) {
    case this.Rating.Again:
      // Reset learning progress
      card.learning_steps = 0;
      card.due = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      break;

    case this.Rating.Hard:
      // Small progress in learning
      card.learning_steps += 1;
      card.due = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes
      break;

    case this.Rating.Good:
      card.learning_steps += 1;

      // If completed learning steps, graduate to review
      if (card.learning_steps >= 3) {
        card.state = this.States.REVIEW;
        card.stability = 3;
        card.due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
      } else {
        // Otherwise, increase interval within learning
        const intervals = [0, 30, 240, 1440]; // minutes: 0, 30min, 4h, 1d
        const minutesToAdd = intervals[card.learning_steps] || 1440;
        card.due = new Date(Date.now() + minutesToAdd * 60 * 1000);
      }
      break;

    case this.Rating.Easy:
      // Graduate immediately to review
      card.state = this.States.REVIEW;
      card.stability = 4;
      card.due = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
      break;
  }

  return card;
},

// Handle cards in review phase
_handleReviewCard: function (card, rating) {
  this._updateDifficulty(card, rating);

  switch (rating) {
    case this.Rating.Again:
      // Failed review, move to relearning
      card.state = this.States.RELEARNING;
      card.lapses += 1;
      card.learning_steps = 0;

      // Reduce stability
      card.stability = Math.max(0.5, card.stability * 0.4);
      card.due = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      break;

    case this.Rating.Hard:
      // Slightly harder recall
      card.stability = card.stability * 1.15;
      card.scheduled_days = Math.max(1, Math.floor(card.stability * 0.9));
      card.due = new Date(
        Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
      );
      break;

    case this.Rating.Good:
      // Normal review success
      const stabilityMultiplier = 1.4 * (1 - 0.4 * card.difficulty);
      card.stability = card.stability * stabilityMultiplier;

      // Next interval
      card.scheduled_days = Math.max(1, Math.floor(card.stability));
      card.due = new Date(
        Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
      );
      break;

    case this.Rating.Easy:
      // Easy recall
      const easyMultiplier = 2.0 * (1 - 0.25 * card.difficulty);
      card.stability = card.stability * easyMultiplier;

      // Slight bonus interval
      card.scheduled_days = Math.max(1, Math.floor(card.stability * 1.4));
      card.due = new Date(
        Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
      );
      break;
  }

  return card;
},

// Handle cards in relearning phase
_handleRelearningCard: function (card, rating) {
  switch (rating) {
    case this.Rating.Again:
      // Reset relearning progress
      card.learning_steps = 0;
      card.due = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      break;

    case this.Rating.Hard:
      // Small progress in relearning
      card.learning_steps += 1;
      card.due = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      break;

    case this.Rating.Good:
      card.learning_steps += 1;

      // If completed relearning steps, return to review
      if (card.learning_steps >= 2) {
        card.state = this.States.REVIEW;
        // Reduced stability compared to normal graduation
        card.stability = Math.max(2, card.stability);
        card.due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
      } else {
        // Otherwise, increase interval within relearning
        const intervals = [0, 60, 240]; // minutes: 0, 1h, 4h
        const minutesToAdd = intervals[card.learning_steps] || 240;
        card.due = new Date(Date.now() + minutesToAdd * 60 * 1000);
      }
      break;

    case this.Rating.Easy:
      // Return to review with slightly reduced stability
      card.state = this.States.REVIEW;
      card.stability = Math.max(2, card.stability * 0.9);
      card.scheduled_days = Math.max(1, Math.floor(card.stability));
      card.due = new Date(
        Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
      );
      break;
  }

  return card;
},


  // Update card difficulty based on performance
  _updateDifficulty: function (card, rating) {
    // Current difficulty
    let difficulty = card.difficulty;

    // Adjust difficulty based on rating
    switch (rating) {
      case this.Rating.Again:
        difficulty += 0.15;
        break;
      case this.Rating.Hard:
        difficulty += 0.05;
        break;
      case this.Rating.Good:
        // Slight regression to the mean
        difficulty = difficulty + (0.3 - difficulty) * 0.05;
        break;
      case this.Rating.Easy:
        difficulty -= 0.15;
        break;
    }

    // Ensure difficulty stays within bounds
    card.difficulty = Math.min(1, Math.max(0, difficulty));

    return card;
  },
};

module.exports.batchUpdate = async (req, res, next) => {
  const { toUpdateCardsData } = req.body;
  if (!Array.isArray(toUpdateCardsData) || toUpdateCardsData.length === 0) {
    return res
      .status(400)
      .send('You must send a non-empty "toUpdateCardsData" array');
  }
  try {
    const cardIds = toUpdateCardsData.map((c) => c._id);
    const existingCards = await CardModel.find({
      _id: { $in: cardIds },
    }).lean();
    const ops = [];

    for (const { _id, answer } of toUpdateCardsData) {
      const existing = existingCards.find((c) => c._id.toString() === _id);
      if (!existing) continue;

      // Create a card object with the existing card's properties
      const card = {
        stability: existing.stability ?? 0,
        difficulty: existing.difficulty ?? 0.3,
        elapsed_days: existing.elapsed_days ?? 0,
        scheduled_days: existing.scheduled_days ?? 0,
        learning_steps: existing.learning_steps ?? 0,
        reps: existing.reps ?? 0,
        lapses: existing.lapses ?? 0,
        state: parseInt(existing.state) ?? 0,
        last_review: existing.last_review ?? new Date(),
        due: existing.due ?? new Date(),
      };

      // Map the answer to our rating system
      let rating;
      switch ((answer || "").toLowerCase()) {
        case "forgot":
          rating = SRS.Rating.Again;
          break;
        case "hard":
          rating = SRS.Rating.Hard;
          break;
        case "medium":
          rating = SRS.Rating.Good;
          break;
        case "easy":
          rating = card.state === 0 ? SRS.Rating.Good : SRS.Rating.Easy;
          break;
        default:
          rating = SRS.Rating.Good;
      }

      // Calculate the next interval using our custom SRS system
      const updatedCard = SRS.calculateNextInterval(card, rating);

      // Push the update operation
      ops.push({
        updateOne: {
          filter: { _id: existing._id },
          update: {
            $set: {
              stability: updatedCard.stability,
              difficulty: updatedCard.difficulty,
              elapsed_days: updatedCard.elapsed_days,
              scheduled_days: updatedCard.scheduled_days,
              learning_steps: updatedCard.learning_steps,
              reps: updatedCard.reps,
              lapses: updatedCard.lapses,
              state: updatedCard.state,
              last_review: updatedCard.last_review,
              due: updatedCard.due,
            },
            $inc: { reviewCount: 1 },
          },
        },
      });
    }

    if (ops.length > 0) {
      const result = await CardModel.bulkWrite(ops);
      return res.status(200).json({ modifiedCount: result.modifiedCount });
    }
    res.status(200).json({ modifiedCount: 0 });
  } catch (err) {
    console.error(err);
    res.status(400).send("Error in updating the study cards");
  }
};

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
async function resetAllCards() {
  try {
    // 1. Fetch all cards from the DB
    const cards = await CardModel.find({});
    if (!cards.length) {
      console.log("No cards found to reset.");
      return;
    }

    // 2. Prepare bulk update operations
    const operations = cards.map((card) => {
      // Create a fresh baseline from your SRS model
      const baseCard = SRS.createEmptyCard(new Date());

      // Build the update payload
      const resetData = {
        stability: baseCard.stability,
        difficulty: baseCard.difficulty,
        elapsed_days: baseCard.elapsed_days,
        scheduled_days: baseCard.scheduled_days,
        learning_steps: baseCard.learning_steps,
        reps: baseCard.reps,
        lapses: baseCard.lapses,
        state: baseCard.state,
        last_review: baseCard.last_review,
        due: baseCard.due,
        reviewCount: 0,
      };

      return {
        updateOne: {
          filter: { _id: card._id },
          update: { $set: resetData },
        },
      };
    });

    // 3. Perform bulk write
    const result = await CardModel.bulkWrite(operations);
    console.log(`✅ Cards reset: ${result.modifiedCount}/${cards.length}`);
  } catch (err) {
    console.error("❌ Error resetting cards:", err);
  }
}

module.exports.getUserCards = async (req, res, next) => {
  // resetAllCards();
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
    // 1. الترتيب يكون دائمًا حسب الأقدم استحقاقًا
    options.sort = { due: 1, difficulty: 1, createdAt: 1, _id: 1 };

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
      .lean(); // الثانية بالـ pagination
    // const allCards = await CardModel.find().lean(); // الثانية بالـ pagination

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
// module.exports.batchUpdate = async (req, res, next) => {
//   const { toUpdateCardsData } = req.body;
//   if (!Array.isArray(toUpdateCardsData) || toUpdateCardsData.length === 0) {
//     return res
//       .status(400)
//       .send('You must send a non-empty "toUpdateCardsData" array');
//   }

//   try {
//     const cardIds = toUpdateCardsData.map((c) => c._id);
//     const existingCards = await CardModel.find({
//       _id: { $in: cardIds },
//     }).lean();

//     const ops = [];

//     // 🧠 دالة تحديث الكارت زي أنكي لكن تقبل قيمك الحالية من الفرونت (1، 0.5، -0.5، -1)
//     const updateCardReview = (card, answerValue) => {
//       const currentEase = card.easeFactor || 0.5;
//       const currentStability = card.stability || 1;

//       // 🧮 نعمل تطبيع للقيم الجاية من الفرونت
//       // 1 → +0.15, 0.5 → +0.07, -0.5 → -0.07, -1 → -0.15 تقريبًا
//       const normalizedDelta  = answerValue / 6.7; // رقم تجريبي قريب من أنكي الحقيقي

//       // 📉 كل ما زاد الثبات → التغيير يقل (زي أنكي)
//       const changeFactor = 1 / Math.log2(currentStability + 1);

//       let newEaseFactor = currentEase + normalizedDelta * changeFactor;
//       newEaseFactor = Math.min(Math.max(newEaseFactor, 0), 1);

//       // 📈 نحسب الثبات الجديد بناءً على الأداء
//       let newStability = currentStability;
//       if (answerValue <= -0.9) {
//         // again
//         newStability = 1;
//       } else if (answerValue < 0) {
//         // hard
//         newStability *= 1.2;
//       } else if (answerValue === 0.5) {
//         // medium
//         newStability *= 2.5 * (0.8 + newEaseFactor);
//       } else if (answerValue === 1) {
//         // easy
//         newStability *= 3.0 * (0.8 + newEaseFactor);
//       }

//       newStability = Math.min(Math.max(newStability, 1), 60);

//       return {
//         newEaseFactor: +newEaseFactor.toFixed(3),
//         newStability: +newStability.toFixed(2),
//       };
//     };

//     // 🕒 أقصى انتظار ديناميكي زي أنكي
//     for (const { _id, answer } of toUpdateCardsData) {
//       const existing = existingCards.find((c) => c._id.toString() === _id);
//       if (!existing) continue;

//       const stability = existing.stability || 1;
//       const easeFactorTimestamp = new Date(
//         existing.easeFactorDate || 0
//       ).getTime();
//       const currentTimestamp = Date.now();

//       const maxWait = 3 * 60 * 60 * 1000;
//       const minWait = 15 * 60 * 1000;
//       const k = 0.1;
//       let dynamicWait = maxWait * Math.exp(-k * stability);
//       dynamicWait = Math.max(dynamicWait, minWait);

//       // ⏳ لو لسه الوقت ماكملش المدة المطلوبة → متحدثش الكارت
//       if (currentTimestamp - easeFactorTimestamp < dynamicWait) continue;

//       const { newEaseFactor, newStability } = updateCardReview(
//         existing,
//         answer
//       );

//       ops.push({
//         updateOne: {
//           filter: { _id: existing._id },
//           update: {
//             $set: {
//               easeFactor: newEaseFactor,
//               stability: newStability,
//               easeFactorDate: new Date(),
//             },
//             $inc: { reviewCount: 1 },
//           },
//         },
//       });
//     }

//     if (ops.length > 0) {
//       const result = await CardModel.bulkWrite(ops);
//       return res.status(200).json({ modifiedCount: result.modifiedCount });
//     }

//     res.status(200).json({ modifiedCount: 0 });
//   } catch (err) {
//     console.error(err);
//     res.status(400).send("error in updating the study cards");
//   }
// };

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
