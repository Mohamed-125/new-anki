const TopicModel = require("../models/TopicModel");
const TextModel = require("../models/TextModel");
const VideoModel = require("../models/VideoModel");
const mongoose = require("mongoose");
const textModel = require("../models/TextModel");
const Channel = require("../models/ChannelModel");
const CourseModel = require("../models/CourseModel");

module.exports.getTopics = async (req, res) => {
  const { page: pageNumber, searchQuery, courseId, topicLanguage } = req.query;

  const limit = 5;
  let page = +pageNumber || 0;

  try {
    const query = {};

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }
    if (courseId) {
      query.courseId = courseId;
    }
    if (courseId) {
      query.courseId = courseId;
    }
    if (topicLanguage) {
      query.topicLanguage = topicLanguage;
    }

    const topicsCount = await TopicModel.countDocuments(query);

    const skipNumber = page * limit;
    const remaining = Math.max(0, topicsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const topics = await TopicModel.find(query)
      .skip(skipNumber)
      .limit(limit)
      .lean();

    res.status(200).send({ topics, topicsCount, nextPage });
  } catch (err) {
    console.log("error getting topics", err);
    res.status(400).send(err);
  }
};

module.exports.getTopic = async (req, res) => {
  try {
    const topic = await TopicModel.findOne({ _id: req.params.id }).lean();

    if (!topic) {
      return res.status(404).send("Topic not found");
    }

    res.send(topic);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
};

module.exports.getTopicTexts = async (req, res) => {
  const topicId = req.params?.id;
  const pageNumber = req.query?.page;

  if (!topicId) return res.status(400).send("you have to send the topicId");

  const limit = 5;
  let page = +pageNumber || 0;
  const skipNumber = page * limit;
  const textsCount = await textModel.countDocuments({ topicId });

  const remaining = Math.max(0, textsCount - limit * (page + 1));
  const nextPage = remaining > 0 ? page + 1 : null;

  try {
    const texts = await textModel
      .find({ topicId })
      .skip(skipNumber)
      .limit(limit);

    res.send({ texts, textsCount, nextPage });
  } catch (err) {
    console.log("topic controller get texts error", texts);
    res.status(400).send(err);
  }
};

module.exports.getTopicVideos = async (req, res) => {
  const topicId = req.params?.id;
  const pageNumber = req.query?.page;
  if (!topicId) return res.status(400).send("you have to send the topicId");

  const limit = 5;
  let page = +pageNumber || 0;
  const skipNumber = page * limit;
  const videosCount = await VideoModel.countDocuments({ topicId });

  const remaining = Math.max(0, videosCount - limit * (page + 1));
  const nextPage = remaining > 0 ? page + 1 : null;

  try {
    const videos = await VideoModel.find({ topicId }, { defaultCaptionData: 0 })
      .skip(skipNumber)
      .limit(limit);

    res.send({ videos, videosCount, nextPage });
  } catch (err) {
    console.log("topic controller get videos error", videos);
    res.status(400).send(err);
  }
};
module.exports.getTopicChannels = async (req, res) => {
  const topicId = req.params?.id;
  const pageNumber = req.query?.page;
  if (!topicId) return res.status(400).send("you have to send the topicId");

  const limit = 5;
  let page = +pageNumber || 0;
  const skipNumber = page * limit;
  const channelsCount = await Channel.countDocuments({ topicId });

  const remaining = Math.max(0, channelsCount - limit * (page + 1));
  const nextPage = remaining > 0 ? page + 1 : null;

  try {
    const channels = await Channel.find({ topicId })
      .skip(skipNumber)
      .limit(limit);

    res.send({ channels, channelsCount, nextPage });
  } catch (err) {
    console.log("topic controller get channels error", err);
    res.status(400).send(err);
  }
};

// module.exports.getTopicChannels = async (req, res) => {
//   const topicId = req.params?.topicId;
//   if (!topicId) return res.status(400).send("you have to send the topicId");

//   const limit = 5;
//   let page = +pageNumber || 0;
//   const skipNumber = page * limit;

//   const remaining = Math.max(
//     0,
//     topicWithResources?.lessonsCount - limit * (page + 1)
//   );
//   const nextPage = remaining > 0 ? page + 1 : null;

//   try {
//     const channels = await channelModel
//       .find({ topicId })
//       .skip(skipNumber)
//       .limit(limit);

//     const channelsCount = await channelModel.countDocuments({ topicId });

//     res.send({ channels, channelsCount, nextPage });
//   } catch (err) {
//     console.log("topic controller get channels error", channels);
//     res.status(400).send(err);
//   }
// };

module.exports.createTopic = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).send("Title is required");
  }

  try {
    const createdTopic = await TopicModel.create({
      ...req.body,
      userId: req.user?.id,
    });

    res.status(201).send(createdTopic);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.updateTopic = async (req, res) => {
  try {
    const updatedTopic = await TopicModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    if (!updatedTopic) {
      return res
        .status(404)
        .send("Topic not found or you don't have permission to update it");
    }

    res.send(updatedTopic);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.deleteTopic = async (req, res) => {
  try {
    const deletedTopic = await TopicModel.findOneAndDelete({
      _id: req.params.id,
    });

    if (!deletedTopic) {
      return res
        .status(404)
        .send("Topic not found or you don't have permission to delete it");
    }

    res.send(deletedTopic);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.batchDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send("Valid topic IDs array is required");
    }

    const result = await TopicModel.deleteMany({
      _id: { $in: ids },
      userId: req.user?._id,
    });

    res.send({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(400).send(err);
  }
};
