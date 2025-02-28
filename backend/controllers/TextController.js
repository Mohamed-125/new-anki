const TextModel = require("../models/TextModel");

module.exports.getTexts = async (req, res) => {
  const texts = await TextModel.find({ userId: req.user?._id });
  res.send(texts);
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
    userId: req.user?._id,
    ...req.body,
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
