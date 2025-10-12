const CardModel = require("../models/CardModel");
const CollectionModel = require("../models/CollectionModel");
const { fsrs, createEmptyCard, Rating } = require("ts-fsrs");

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
    const f = fsrs({});
    for (const { _id, answer } of toUpdateCardsData) {
      const existing = existingCards.find((c) => c._id.toString() === _id);
      if (!existing) continue;
      const card = createEmptyCard(existing.last_review ?? new Date());
      console.log("empty card", card);
      card.stability = existing.stability ?? 0;
      card.difficulty = existing.difficulty ?? 0;
      card.elapsed_days = existing.elapsed_days ?? 0;
      card.scheduled_days = existing.scheduled_days ?? 0;
      card.learning_steps = existing.learning_steps ?? 0;
      card.reps = existing.reps ?? 0;
      card.lapses = existing.lapses ?? 0;
      card.state = parseInt(existing.state) ?? 0;

      console.log("card", card);
      let grade;
      switch ((answer || "").toLowerCase()) {
        case "forgot":
          grade = Rating.Again;
          break;
        case "hard":
          grade = Rating.Hard;
          break;
        case "medium":
          grade = Rating.Good;
          break;
        case "easy":
          grade = card.state === 0 ? Rating.Good : Rating.Easy;
          break;
        default:
          grade = Rating.Good;
      }
      const scheduling = f.repeat(card, new Date());
      console.log(scheduling, scheduling[grade], grade);
      const updatedCard = scheduling[grade]?.card;
      if (!updatedCard) {
        console.warn("FSRS repeat failed for card", _id);
        continue;
      }
      console.log("updatedCard", updatedCard);
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
    const cards = await CardModel.find({});

    const ops = cards.map((card) => {
      const fsrsCard = createEmptyCard(new Date());

      return {
        updateOne: {
          filter: { _id: card._id },
          update: {
            $set: {
              // تحديث الحقول الخاصة بـ FSRS
              stability: fsrsCard.stability,
              difficulty: fsrsCard.difficulty,
              elapsed_days: fsrsCard.elapsed_days,
              scheduled_days: fsrsCard.scheduled_days,
              learning_steps: fsrsCard.learning_steps,
              reps: fsrsCard.reps,
              lapses: fsrsCard.lapses,
              state: fsrsCard.state,
              last_review: fsrsCard.last_review,
              due: fsrsCard.due,

              // إعادة تعيين الإحصائيات القديمة
              reviewCount: 0,
              easeFactor: 0.5, // إذا كنت تستخدمه مع واجهة المستخدم
            },
          },
        },
      };
    });

    if (ops.length > 0) {
      const result = await CardModel.bulkWrite(ops);
      console.log("Cards reset:", result.modifiedCount);
    }

    console.log("All cards have been reset successfully!");
  } catch (err) {
    console.error("Error resetting cards:", err);
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
    options.sort = { due: 1, difficulty: 1, _id: 1 };

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
