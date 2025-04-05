const TopicModel = require("../models/TopicModel");
const TextModel = require("../models/TextModel");
const VideoModel = require("../models/VideoModel");

module.exports.getTopics = async (req, res) => {
  const { page: pageNumber, searchQuery, language } = req.query;
  const limit = 5;
  let page = +pageNumber || 0;

  try {
    const query = {
      userId: req.user?._id,
    };

    if (searchQuery) {
      query.title = { $regex: searchQuery, $options: "i" };
    }
    if (language) {
      query.language = language;
    }
    const topicsCount = await TopicModel.countDocuments(query);

    const skipNumber = page * limit;
    const remaining = Math.max(0, topicsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const topics = await TopicModel.find(query)
      .skip(skipNumber)
      .limit(limit)
      .lean();

    // Get associated texts and videos for each topic
    const topicsWithResources = await Promise.all(
      topics.map(async (topic) => {
        const [texts, videos] = await Promise.all([
          TextModel.find({ topicId: topic._id }).sort({ topicOrder: 1 }).lean(),
          VideoModel.find({ topicId: topic._id })
            .sort({ topicOrder: 1 })
            .lean(),
        ]);

        const lessons = [
          ...texts.map((text) => ({ ...text, type: "text" })),
          ...videos.map((video) => ({ ...video, type: "video" })),
        ].sort((a, b) => a.topicOrder - b.topicOrder);

        return { ...topic, lessons };
      })
    );

    res
      .status(200)
      .send({ topics: topicsWithResources, nextPage, topicsCount });
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.getTopic = async (req, res) => {
  try {
    const topic = await TopicModel.findOne({ _id: req.params.id }).lean();

    if (!topic) {
      return res.status(404).send("Topic not found");
    }

    // Get associated texts and videos
    const [texts, videos] = await Promise.all([
      TextModel.find({ topicId: topic._id }).sort({ topicOrder: 1 }).lean(),
      VideoModel.find({ topicId: topic._id }).sort({ topicOrder: 1 }).lean(),
    ]);

    // Transform texts and videos into lessons array with type information
    const lessons = [
      ...texts.map((text) => ({ ...text, type: "text" })),
      ...videos.map((video) => ({ ...video, type: "video" })),
    ].sort((a, b) => a.topicOrder - b.topicOrder);

    // Add lessons array to the response
    const topicWithResources = {
      ...topic,
      lessons,
    };

    res.send(topicWithResources);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.createTopic = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).send("Title is required");
  }

  try {
    const createdTopic = await TopicModel.create(req.body);

    res.status(201).send(createdTopic);
  } catch (err) {
    res.status(400).send(err);
  }
};

module.exports.updateTopic = async (req, res) => {
  try {
    const updatedTopic = await TopicModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?._id },
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
      userId: req.user?._id,
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

// module.exports.addVideoToTopic = async (req, res) => {
//   try {
//     const { topicId, videoId } = req.body;

//     if (!topicId || !videoId) {
//       return res.status(400).send("Topic ID and Video ID are required");
//     }

//     const updatedTopic = await TopicModel.findOneAndUpdate(
//       { _id: topicId, userId: req.user?._id },
//       { $addToSet: { videos: videoId } },
//       { new: true }
//     );

//     if (!updatedTopic) {
//       return res
//         .status(404)
//         .send("Topic not found or you don't have permission");
//     }

//     res.send(updatedTopic);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

// module.exports.addTextToTopic = async (req, res) => {
//   try {
//     const { topicId, textId } = req.body;

//     if (!topicId || !textId) {
//       return res.status(400).send("Topic ID and Text ID are required");
//     }

//     const updatedTopic = await TopicModel.findOneAndUpdate(
//       { _id: topicId, userId: req.user?._id },
//       { $addToSet: { texts: textId } },
//       { new: true }
//     );

//     if (!updatedTopic) {
//       return res
//         .status(404)
//         .send("Topic not found or you don't have permission");
//     }

//     res.send(updatedTopic);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

// module.exports.removeVideoFromTopic = async (req, res) => {
//   try {
//     const { topicId, videoId } = req.body;

//     if (!topicId || !videoId) {
//       return res.status(400).send("Topic ID and Video ID are required");
//     }

//     const updatedTopic = await TopicModel.findOneAndUpdate(
//       { _id: topicId, userId: req.user?._id },
//       { $pull: { videos: videoId } },
//       { new: true }
//     );

//     if (!updatedTopic) {
//       return res
//         .status(404)
//         .send("Topic not found or you don't have permission");
//     }

//     res.send(updatedTopic);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

// module.exports.removeTextFromTopic = async (req, res) => {
//   try {
//     const { topicId, textId } = req.body;

//     if (!topicId || !textId) {
//       return res.status(400).send("Topic ID and Text ID are required");
//     }

//     const updatedTopic = await TopicModel.findOneAndUpdate(
//       { _id: topicId, userId: req.user?._id },
//       { $pull: { texts: textId } },
//       { new: true }
//     );

//     if (!updatedTopic) {
//       return res
//         .status(404)
//         .send("Topic not found or you don't have permission");
//     }

//     res.send(updatedTopic);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };
