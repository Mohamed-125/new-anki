const TextModel = require("../models/TextModel");

module.exports.getTexts = async (req, res) => {
  const { page: pageNumber, searchQuery, language } = req.query;
  const limit = 5;
  let page = +pageNumber || 0;

  try {
    const query = {
      userId: req.user?._id,
      topicId: { $exists: false },
    };

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }
    if (language) {
      query.language = language;
    }
    const textsCount = await TextModel.countDocuments(query);

    console.log("textsCount", textsCount);
    const skipNumber = page * limit;
    const remaining = Math.max(0, textsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const texts = await TextModel.find(query, { content: 0 })
      .skip(skipNumber)
      .limit(limit);

    res.status(200).send({ texts, nextPage, textsCount });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getText = async (req, res) => {
  const text = await TextModel.findOne({ _id: req.params.id });
  res.send(text);
};

module.exports.createText = async (req, res) => {
  if (!req.body.title || !req.body.content) {
    return res.status(400).send("Title and content are required");
  }

  const createdText = await TextModel.create({
    ...req.body,
    userId: req.user?._id,
  });
  res.send(createdText);
};

module.exports.updateText = async (req, res) => {
  const updatedText = await TextModel.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );
  res.send(updatedText);
};

module.exports.deleteText = async (req, res) => {
  await TextModel.findByIdAndDelete({ _id: req.params.id });
  res.send("text deleted successfully");
};

module.exports.batchDelete = async (req, res) => {
  const { ids } = req.body;

  try {
    // Assuming you're using a database model like `Video`
    await TextModel.deleteMany({ _id: { $in: ids } });
    res.status(200).send({ message: "texts deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting texts" });
  }
};

module.exports.forkText = async (req, res) => {
  try {
    const originalText = await TextModel.findOne({ _id: req.params.id }).lean();
    if (!originalText) {
      return res.status(404).send("Text not found");
    }
    if (originalText?.topicId) delete originalText?.topicId;

    const forkedText = await TextModel.create({
      userId: req.user?._id,
      ...originalText,
    });

    res.status(200).send(forkedText);
  } catch (err) {
    res.status(400).send(err);
  }
};
