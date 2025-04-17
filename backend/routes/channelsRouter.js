const express = require("express");
const axios = require("axios");
const Channel = require("../models/ChannelModel");
const Video = require("../models/VideoModel");
const VideoModel = require("../models/VideoModel");

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
router.post("/", async (req, res) => {
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
    // const newChannel = new Channel({
    //   name: details.title,
    //   description: details.description,
    //   thumbnail: details.thumbnails.default.url,
    //   url,
    //   channelId,
    //   topicId,
    //   topicOrder,
    // });

    // await newChannel.save();

    // 📹 Get most popular 50 videos from this channel
    const videosRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          channelId,
          maxResults: 30,
          key: YOUTUBE_API_KEY,
        },
      }
    );

    const videos = videosRes.data.items
      .map((video) => {
        return {
          url: `https://www.youtube.com/watch?v=${video?.id?.videoId}`,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails.medium.url,
          publishedAt: video.snippet.publishedAt,
          videoId: video?.id?.videoId,
        };
      })
      .filter((video) => {
        if (!video.title.includes("#shorts")) {
          if (video.videoId) return video;
        }
      });

    // Fetch transcripts with improved error handling
    const transcriptPromises = videos.map((video) => {
      return axios
        .post(
          "https://new-anki-one.vercel.app/api/v1/transcript/get-transcript",

          {
            url: video.url,
            lang: "de",
          }
        )
        .catch((error) => {
          console.error(
            `Failed to fetch transcript for video ${video.url}:`,
            error.message
          );
          return { status: "rejected", reason: error };
        });
    });

    const transcriptsArr = await Promise.allSettled(transcriptPromises);

    // // Process only successful transcript fetches
    // const successfulTranscripts = transcriptsArr
    //   .map((result, idx) => {
    //     if (result.status === "fulfilled" && result.value?.data?.transcript) {
    //       return {
    //         transcript: result.value.data.transcript,
    //         videoIndex: idx,
    //       };
    //     }
    //     return null;
    //   })
    //   .filter(Boolean);

    // // Prepare translation requests only for successful transcripts
    // const translationPromises = successfulTranscripts.flatMap(
    //   ({ transcript }) => {
    //     return transcript.map((t) => {
    //       return axios
    //         .post(
    //           "https://new-anki-server.vercel.app/api/v1/translate?targetLanguage=en",
    //           { text: t.text }
    //         )
    //         .catch((error) => {
    //           console.error(
    //             `Translation failed for text: ${t.text}`,
    //             error.message
    //           );
    //           return null;
    //         });
    //     });
    //   }
    // );

    // const translationResults = await Promise.allSettled(translationPromises);

    // // Process videos with successful transcripts and translations
    // const videosWithTranscripts = videos
    //   .map((video, idx) => {
    //     const transcriptData = successfulTranscripts.find(
    //       (t) => t.videoIndex === idx
    //     );

    //     if (!transcriptData) return null;

    //     const transcript = transcriptData.transcript;
    //     const startIndex = transcriptData.videoIndex * transcript.length;
    //     const endIndex = startIndex + transcript.length;
    //     const videoTranslations = translationResults
    //       .slice(startIndex, endIndex)
    //       .map((result) =>
    //         result.status === "fulfilled"
    //           ? result.value?.data?.translatedText
    //           : null
    //       )
    //       .filter(Boolean);

    //     return {
    //       ...video,
    //       defaultCaptionData: {
    //         transcript,
    //         translatedTranscript: videoTranslations,
    //       },
    //     };
    //   })
    //   .filter(Boolean);

    // // Save videos to database with reference to the channel
    // const videosToSave = videosWithTranscripts.map((video) => {
    //   return {
    //     ...video,
    //     topicId: topicId,
    //     topicOrder: topicOrder,
    //     channelId: newChannel._id,
    //   };
    // });

    // Insert all videos in a single batch operation
    // await Video.insertMany(videosToSave);

    res.status(201).send({
      // channel: newChannel,
      // popularVideos: videosWithTranscripts,
      transcriptsArr,
      // translationResults: translationResults,
      // translationPromises,
    });
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: `error adding channel ${error}` });
  }
});

// 📤 GET channel videos
router.get("/get-videos", async (req, res) => {
  try {
    const query = {
      channelId: req.query.channelId,
    };
    const pageNumber = req.query?.page;
    const limit = 5;
    let page = +pageNumber || 0;
    const skipNumber = page * limit;
    const videosCount = await VideoModel.countDocuments(query);
    const remaining = Math.max(0, videosCount - limit * (page + 1));
    const nextPage = remaining > 0 ? page + 1 : null;

    const videos = await VideoModel.find(query, { defaultCaptionData: 0 })
      .skip(skipNumber)
      .limit(limit);

    const allVideos = await VideoModel.find(query, {
      defaultCaptionData: 0,
    }).sort({ createdAt: -1 });

    console.log("channel videos", allVideos);
    res.send({ videos, videosCount, nextPage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📤 GET all channels
router.get("/", async (req, res) => {
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

// 📤 Delete a channel and its videos (except those with topicId)
router.delete("/:id", async (req, res) => {
  try {
    // First find the channel
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Delete videos that don't have a topicId
    await Video.deleteMany({
      channelId: channel._id,
      topicId: { $exists: false },
    });

    // Delete the channel
    await Channel.findByIdAndDelete(req.params.id);

    res.json({ message: "Channel and associated videos deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📤 GET single channel by ID
router.get("/:id", async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }
    res.json(channel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
