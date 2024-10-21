const { default: axios } = require("axios");
const VideoModel = require("../models/VideoModel");
const { YoutubeTranscript } = require("youtube-transcript");
const cheerio = require("cheerio");
const { default: translate } = require("google-translate-api-x");

module.exports.getVideoAvailavailableCaptions = async (req, res, next) => {
  const { url } = req.body;

  if (!url) return res.status(400).send("you have to enter the video url");

  YoutubeTranscript.fetchTranscript(url, { lang: "1" })
    .then((response) => {})
    .catch((err) => {
      console.log(err.message);
      return res.status(400).send({
        availableCaptions: err.message.split(","),
      });
    });
};

module.exports.getVideoTitle = async (req, res, next) => {
  const videoId = req.params.id;

  axios
    .get(`https://www.youtube.com/watch?v=${videoId}`)
    .then((response) => {
      const $ = cheerio.load(response.data);
      const title = $("title").text();
      const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      res.send({ title, thumbnail });
    })
    .catch((err) => {
      err;
      return res.status(400).send(err.message);
    });
};

module.exports.createVideo = async (req, res, next) => {
  const {
    url,
    videoTitle: title,
    thumbnail,
    availableCaptions,
    defaultCaption,
    playlistId,
  } = req.body;

  if (!url) return res.status(400).send("you have to enter the video url");
  const caption = await YoutubeTranscript.fetchTranscript(url, {
    defaultCaption,
  });

  try {
    const createdVideo = await VideoModel.create({
      url,
      userId: req.user._id,
      title,
      thumbnail,
      availableCaptions,
      defaultCaption,
      playlistId,
    });

    res.status(200).send(createdVideo);
  } catch (err) {
    err.message;
    res.status(400).send(err);
  }
};

module.exports.getTranscript = async (req, res, next) => {
  const { url, lang } = req.query;

  YoutubeTranscript.fetchTranscript(url, { lang })
    .then((response) => {
      res.status(200).send({ caption: response });
    })
    .catch((err) => res.status(400).send(err.message));
};

module.exports.getUserVideos = async (req, res, next) => {
  try {
    const videos = await VideoModel.find({ userId: req.user._id });
    res.status(200).send(videos);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getVideo = async (req, res, next) => {
  try {
    const video = await VideoModel.find({ _id: req.params.id }).populate(
      "videoCards"
    );
    res.status(200).send(video[0]);
  } catch (err) {
    "err", err;
    res.status(400).send(err);
  }
};

module.exports.updateVideo = async (req, res, next) => {
  const { playlistId, defaultCaption } = req.body;

  try {
    const updatedVideo = await VideoModel.findByIdAndUpdate(
      { _id: req.params.id },
      { playlistId, defaultCaption },
      {
        new: true,
      }
    );
    res.status(200).send(updatedVideo);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.deleteVideo = async (req, res, next) => {
  try {
    const deletedTodo = await VideoModel.findByIdAndDelete({
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
    await VideoModel.deleteMany({ _id: { $in: ids } });
    res.status(200).send({ message: "videos deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error deleting videos" });
  }
};
module.exports.batchMove = async (req, res) => {
  const { ids, selectedParent } = req.body;

  try {
    await VideoModel.updateMany(
      { _id: { $in: ids } },
      { playlistId: selectedParent }
    );
    res.status(200).send({ message: "videos moved successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error moveing videos" });
  }
};
