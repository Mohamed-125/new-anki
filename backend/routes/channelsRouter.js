const express = require("express");
const axios = require("axios");
const Channel = require("../models/ChannelModel");
const Video = require("../models/VideoModel");

const router = express.Router();

// Replace with your YouTube API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function extractChannelId(url) {
  const handleRegex = /youtube\.com\/@([^/?]+)/;
  const matchHandle = url.match(handleRegex);

  if (matchHandle) {
    return { type: "handle", value: matchHandle[1] };
  }

  const legacyRegex = /youtube\.com\/(channel|c|user)\/([^/?]+)/;
  const matchLegacy = url.match(legacyRegex);

  if (matchLegacy) {
    return { type: "legacy", value: matchLegacy[2] };
  }

  return null;
}

// 📥 POST /channels - Add new channel with scraping
router.post("", async (req, res) => {
  const { url, topicId, topicOrder = 0 } = req.body;

  try {
    const { type, value } = extractChannelId(url);

    console.log("value ", value);
    // 🧠 Get detailed info about the channel

    let params = {};
    if (type === "legacy") {
      params = {
        part: "snippet",
        id: value,
        key: YOUTUBE_API_KEY,
      };
    } else {
      params = {
        part: "snippet",
        forHandle: value,
        key: YOUTUBE_API_KEY,
      };
    }

    const channelDetailsRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels`,
      {
        params,
      }
    );

    const details = channelDetailsRes.data.items[0].snippet;
    const channelId = channelDetailsRes.data.items[0].id;
    const newChannel = new Channel({
      name: details.title,
      description: details.description,
      thumbnail: details.thumbnails.default.url,
      url,
      channelId,
      topicId,
      topicOrder,
    });

    await newChannel.save();

    // 📹 Get most popular 50 videos from this channel
    const videosRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          channelId,
          maxResults: 70,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const videos = videosRes.data.items
      .map((video) => ({
        videoId: video.id.videoId,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.medium.url,
        publishedAt: video.snippet.publishedAt,
      }))
      .filter((video) => {
        if (!video.title.includes("#shorts")) return video;
      });

    const response = await axios.post("transcript/get-transcript", {
      url,
      lang,
    });
    // Save videos to database with reference to the channel
    const videosToSave = videos.map((video) => {
      return {
        url: `https://www.youtube.com/watch?v=${video.videoId}`,
        title: video.title,
        thumbnail: video.thumbnail,
        topicId: topicId,
        topicOrder: topicOrder,
        // Add channelId reference to link videos to their channel
        channelId: newChannel._id,
      };
    });

    // Insert all videos in a single batch operation
    await Video.insertMany(videosToSave);

    res.status(201).send({ channel: newChannel, popularVideos: videos });
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 📤 GET all channels
router.get("", async (req, res) => {
  try {
    const pageNumber = req.query?.page;
    const limit = 5;
    let page = +pageNumber || 0;
    const skipNumber = page * limit;
    const channelsCount = await Channel.countDocuments();
    const remaining = Math.max(0, channelsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const channels = await Channel.find()
      .skip(skipNumber)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.send({ channels, channelsCount, nextPage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 📤 Delete a channel
router.delete("/:id", async (req, res) => {
  try {
    const channel = await Channel.findOneAndDelete({ _id: req.params.id });
    res.json("deleted");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
