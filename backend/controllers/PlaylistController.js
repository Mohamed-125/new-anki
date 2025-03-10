const PlaylistModel = require("../models/PlaylistModel");

module.exports.createPlaylist = async (req, res, next) => {
  const { name } = req.body;

  if (!name) return res.status(400).send("you have to enter the playlist name");

  try {
    const createdPlaylist = await PlaylistModel.create({
      name,
      userId: req.user?._id,
    });
    res.status(200).send(createdPlaylist);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.getPlaylists = async (req, res, next) => {
  const { page: pageNumber, searchQuery } = req.query;
  const limit = 10;
  let page = +pageNumber || 0;

  try {
    const query = { userId: req.user?._id };
    if (searchQuery) {
      query.name = { $regex: searchQuery, $options: "i" };
    }
    const playlistsCount = await PlaylistModel.countDocuments(query);

    const skipNumber = page * limit;
    const remaining = Math.max(0, playlistsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const playlists = await PlaylistModel.aggregate([
      { $match: query },
      { $skip: skipNumber },
      { $limit: limit },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "playlistId",
          as: "videos",
        },
      },
      {
        $addFields: {
          videosCount: { $size: "$videos" },
        },
      },
      {
        $project: {
          videos: 1,
          name: 1,
          videosCount: 1,
        },
      },
    ]).exec();

    res.status(200).send({ playlists, nextPage, playlistsCount });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getPlaylist = async (req, res, next) => {
  try {
    const playlist = await PlaylistModel.find({
      _id: req.params.id,
    }).populate("playlistVideos");

    res.status(200).send(playlist[0]);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.updatePlaylist = async (req, res, next) => {
  const { name, cards } = req.body;
  try {
    const updatePlaylist = await PlaylistModel.findByIdAndUpdate(
      { _id: req.params.id },
      { name, cards },
      {
        new: true,
      }
    );
    res.status(200).send(updatePlaylist);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.deletePlaylist = async (req, res, next) => {
  try {
    const deletedTodo = await PlaylistModel.findByIdAndDelete({
      _id: req.params.id,
    });
    res.status(200).send("deleted!!");
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.batchDelete = async (req, res) => {
  const { ids } = req.body;

  "ids", ids;

  try {
    // Assuming you're using a database model like `Video`
    await PlaylistModel.deleteMany({ _id: { $in: ids } });
    res.status(200).send({ message: "playlists deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting playlists" });
  }
};
