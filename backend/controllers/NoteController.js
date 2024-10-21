const NoteModel = require("../models/NoteModel");

module.exports.getNotes = async (req, res) => {
  const notes = await NoteModel.find({ userId: req.user._id });
  res.send(notes);
};

module.exports.getNote = async (req, res) => {
  const note = await NoteModel.findOne({ _id: req.params.id });
  res.send(note);
};

module.exports.createNote = async (req, res) => {
  if (!req.body.title || !req.body.content) {
    return res.status(400).send("Title and content are required");
  }
  const createdNote = await NoteModel.create({
    userId: req.user._id,
    ...req.body,
  });
  res.send(createdNote);
};

module.exports.updateNote = async (req, res) => {
  const updatadNote = await NoteModel.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    { new: true }
  );
  res.send(updatadNote);
};

module.exports.deleteNote = async (req, res) => {
  await NoteModel.findByIdAndDelete({ _id: req.params.id });
  res.send("note deleted successfully");
};

module.exports.batchDelete = async (req, res) => {
  const { ids } = req.body;

  try {
    // Assuming you're using a database model like `Video`
    await NoteModel.deleteMany({ _id: { $in: ids } });
    res.status(200).send({ message: "notes deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting notes" });
  }
};
