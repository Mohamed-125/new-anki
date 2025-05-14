const VideoModel = require("../models/VideoModel");
const UserVideoModel = require("../models/UserVideoModel").default;
const axios = require("axios");
const he = require("he");

module.exports.createVideo = async (req, res, next) => {
  try {
    const { url, playlistId, topicId, listId, channelId } = req.body;

    // Fetch transcript
    const transcriptResponse = await axios.post(
      "http://localhost:5000/api/v1/transcript/get-transcript",
      {
        url,
        lang: "de",
        timeout: 900000,
      }
    );

    console.log(transcriptResponse);
    if (!transcriptResponse.data.transcript) {
      throw new Error("Failed to fetch transcript");
    }

    // Sanitize transcript
    const sanitizedTranscript = transcriptResponse.data.transcript.map(
      (item) => ({
        ...item,
        text: he.decode(item.text).trim(),
      })
    );

    // Batch translate transcript with context
    const translateText = async (text, index, transcriptArray) => {
      const maxRetries = 3;
      const retryDelay = 1000;

      // Get context lines (2 before and 2 after)
      const contextLines = [];
      for (
        let i = Math.max(0, index - 2);
        i <= Math.min(transcriptArray.length - 1, index + 2);
        i++
      ) {
        if (i === index) {
          // Remove any existing parentheses from the current line
          const cleanText = transcriptArray[i].text.replace(/[()]/g, "");
          contextLines.push(`((${cleanText}))`);
        } else {
          // Remove any existing parentheses from context lines
          contextLines.push(transcriptArray[i].text.replace(/[()]/g, ""));
        }
      }

      const textWithContext = contextLines.join(" ");

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data: translatedText } = await axios.post(
            "http://localhost:5000/api/v1/translate",
            { text: textWithContext },
            {
              timeout: 300000,
              headers: { "Content-Type": "application/json" },
            }
          );
          return translatedText;
        } catch (error) {
          if (attempt === maxRetries) throw error;
          await new Promise((resolve) =>
            setTimeout(resolve, retryDelay * attempt)
          );
        }
      }
    };

    const batchTranslate = async (texts, batchSize) => {
      const batchedResults = [];
      const delayBetweenBatches = 500;

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        try {
          const batchResults = await Promise.allSettled(
            batch.map((textItem, batchIndex) =>
              translateText(textItem.text, i + batchIndex, texts)
            )
          );

          const translatedBatch = batchResults.map((result) =>
            result.status === "fulfilled" ? result.value : null
          );

          batchedResults.push(...translatedBatch);

          if (i + batchSize < texts.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, delayBetweenBatches)
            );
          }
        } catch (error) {
          console.error(`Error in batch ${i / batchSize + 1}:`, error);
          batchedResults.push(...new Array(batch.length).fill(null));
        }
      }
      return batchedResults;
    };

    const translatedTexts = await batchTranslate(sanitizedTranscript, 3);

    // Combine transcript with translations
    const defaultCaptionData = {
      transcript: sanitizedTranscript.map((item, index) => ({
        ...item,
        translatedText: translatedTexts[index],
      })),
      translatedTranscript: translatedTexts,
    };

    // Create the video with enhanced data
    const createdVideo = await VideoModel.create({
      ...req.body,
      userId: topicId || channelId || listId ? null : req?.user?._id,
      defaultCaptionData,
    });

    if (topicId || channelId || listId)
      [
        // Create user-video association
        await UserVideoModel.create({
          userId: req?.user?._id,
          videoId: createdVideo._id,
          playlistId: playlistId || null,
        }),
      ];

    res.status(201).send(createdVideo);
  } catch (err) {
    console.error("Error creating video:", err);
    res.status(500).json({ error: err.message || "Failed to create video" });
  }
};
module.exports.getUserVideos = async (req, res, next) => {
  const { page: pageNumber, searchQuery, playlistId, language } = req.query;
  const limit = 5;
  let page = +pageNumber || 0;

  try {
    // Get user's video associations
    const userVideoQuery = { userId: req.user._id };
    if (playlistId) {
      userVideoQuery.playlistId = playlistId;
    }

    const userVideos = await UserVideoModel.find(userVideoQuery)
      .sort({ addedAt: -1 })
      .skip(page * limit)
      .limit(limit)
      .lean();

    const videoIds = userVideos.map((uv) => uv.videoId);

    // Get the actual videos
    let videoQuery = {
      _id: { $in: videoIds },
    };

    if (searchQuery) {
      videoQuery.title = { $regex: searchQuery, $options: "i" };
    }

    console.log("videoQuery", videoQuery);

    const videosCount = await VideoModel.countDocuments(videoQuery);
    const remaining = Math.max(0, videosCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const videos = await VideoModel.find(videoQuery, {
      defaultCaptionData: 0,
    }).lean();

    // Sort videos in the same order as userVideos
    const sortedVideos = videoIds
      .map((id) => videos.find((v) => v._id.toString() === id.toString()))
      .filter(Boolean);

    res.status(200).send({ videos: sortedVideos, nextPage, videosCount });
  } catch (err) {
    console.log(err);
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
  try {
    const updatedVideo = await VideoModel.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
      }
    );
    res.status(200).send(updatedVideo);
  } catch (err) {
    res.status(400).send(err);
  }
};
module.exports.deleteVideo = async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id);
    if (!video) return res.status(404).send("Video not found");

    const isOwner = video.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    const hasLinks = video.topicId || video.channelId || video.listId;

    // Admins can delete everything
    if (isAdmin) {
      await VideoModel.findByIdAndDelete(req.params.id);
    } else if (isOwner && !hasLinks) {
      // Owner can delete if no links
      await VideoModel.findByIdAndDelete(req.params.id);
    }

    // Always remove the user’s reference to the video
    await UserVideoModel.deleteOne({
      userId: req.user._id,
      videoId: req.params.id,
    });

    res.status(200).send("Video removed successfully");
  } catch (err) {
    console.error("Error deleting the video", err);
    res.status(500).send("Error deleting the video");
  }
};

module.exports.batchDelete = async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).send({ error: "No video IDs provided" });
  }

  try {
    const videos = await VideoModel.find({ _id: { $in: ids } });

    const isAdmin = req.user.role === "admin";

    const deletableVideoIds = [];

    // Determine which videos the user can delete
    for (const video of videos) {
      const isOwner = video.userId.toString() === req.user._id.toString();
      const hasLinks = video.topicId || video.channelId || video.listId;

      if (isAdmin || (isOwner && !hasLinks)) {
        deletableVideoIds.push(video._id);
      }
    }

    // Delete allowed videos
    if (deletableVideoIds.length > 0) {
      await VideoModel.deleteMany({ _id: { $in: deletableVideoIds } });
    }

    // Always delete user's references
    await UserVideoModel.deleteMany({
      userId: req.user._id,
      videoId: { $in: ids },
    });

    res.status(200).send({
      message: "Videos and/or references removed successfully",
      deletedVideos: deletableVideoIds,
    });
  } catch (error) {
    console.error("Error batch deleting videos", error);
    res.status(500).send({ error: "Error batch deleting videos" });
  }
};

module.exports.batchMove = async (req, res) => {
  const { ids, selectedParent } = req.body;

  try {
    // Update user-video associations with new playlist
    await UserVideoModel.updateMany(
      {
        userId: req.user._id,
        videoId: { $in: ids },
      },
      { playlistId: selectedParent }
    );

    res.status(200).send({ message: "Videos moved successfully" });
  } catch (error) {
    res.status(500).send({ error: "Error moving videos" });
  }
};
module.exports.shareVideo = async (req, res) => {
  try {
    const video = await VideoModel.findById(req.params.id);
    if (!video) {
      return res.status(404).send("Video not found");
    }

    // Check if user already has this video
    const existingUserVideo = await UserVideoModel.findOne({
      userId: req.user._id,
      videoId: video._id,
    });

    if (existingUserVideo) {
      return res.status(400).send("Video already in your library");
    }

    // Create user-video association
    const userVideo = await UserVideoModel.create({
      userId: req.user._id,
      videoId: video._id,
      playlistId: req.body.playlistId || null,
    });

    res.status(200).send({ message: "Video shared successfully", userVideo });
  } catch (err) {
    res.status(400).send(err);
  }
};
