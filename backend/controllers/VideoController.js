const { default: axios } = require("axios");
const VideoModel = require("../models/VideoModel");
const { YoutubeTranscript } = require("youtube-transcript");
const cheerio = require("cheerio");

module.exports.getVideoAvailavailableCaptions = async (req, res, next) => {
  const { url } = req.body;

  if (!url) return res.status(400).send("you have to enter the video url");

  YoutubeTranscript.fetchTranscript(url, { lang: "1" })
    .then((response) => {})
    .catch((err) => {
      console.log("err", err);
      if (err.message.includes("thisLangDoesNotExsist")) {
        console.log("thisLangDoesNotExsist", err.message);
        return res.status(400).send({
          availableCaptions: err.message
            .substring(err.message.indexOf(":") + 1)
            .split(","),
        });
      }
      return res.status(400).send(err.message);
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
      console.log(err);
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
  } = req.body;

  if (!url) return res.status(400).send("you have to enter the video url");

  const createdVideo = await VideoModel.create({
    url,
    userId: req.user._id,
    title,
    thumbnail,
    availableCaptions,
    defaultCaption,
  });
  res.status(200).send(createdVideo);
};

module.exports.getTranscript = async (req, res, next) => {
  const { url, lang } = req.query;

  console.log("url , lang", url, lang);
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
    console.log("err", err);
    res.status(400).send(err);
  }
};

module.exports.updateVideo = async (req, res, next) => {
  const { word, translation, examples, collection } = req.body;
  try {
    const updateVideo = await VideoModel.findByIdAndUpdate(
      { _id: req.params.id },
      { word, translation, examples, collection, userId: req.user._id },
      {
        new: true,
      }
    );
    res.status(200).send(updateVideo);
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
