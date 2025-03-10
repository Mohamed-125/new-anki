const NoteModel = require("../models/NoteModel");

module.exports.getNotes = async (req, res) => {
  const { page: pageNumber, searchQuery } = req.query;
  const limit = 5;
  let page = +pageNumber || 0;

  try {
    const query = { userId: req.user?._id };
    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }
    const notesCount = await NoteModel.countDocuments(query);

    const skipNumber = page * limit;
    const remaining = Math.max(0, notesCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const notes = await NoteModel.find(query).skip(skipNumber).limit(limit);

    res.status(200).send({ notes, nextPage, notesCount });
  } catch (err) {
    res.status(400).send(err);
  }
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
    userId: req.user?._id,
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
