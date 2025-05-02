const express = require("express");
const axios = require("axios");
const Channel = require("../models/ChannelModel");
const Video = require("../models/VideoModel");
const VideoModel = require("../models/VideoModel");
const mongoose = require("mongoose");
const router = express.Router();
const he = require("he");

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

    if (
      !channelDetailsRes.data.items ||
      channelDetailsRes.data.items.length === 0
    ) {
      return res.status(404).json({
        error: "Channel not found. Please check the URL and try again.",
      });
    }

    const details = channelDetailsRes.data.items[0].snippet;
    const channelId = channelDetailsRes.data.items[0].id;

    const newChannel = await Channel.create({
      name: he.decode(details.title).trim(),
      description: he.decode(details.description).trim(),
      thumbnail: details.thumbnails.default.url,
      url,
      channelId,
      topicId,
      topicOrder,
    });

    const videosRes = await axios.get(
      `https://www.googleapis.com/youtube/v3/search`,
      {
        params: {
          part: "snippet",
          channelId,
          maxResults: 40,
          key: YOUTUBE_API_KEY,
          type: "video", // REQUIRED to use videoDuration
          videoDuration: "medium", // options: any | short | medium | long
          order: "viewCount", // optional: to get most popular
        },
      }
    );

    const videos = videosRes.data.items
      .map((video) => {
        return {
          url: `https://www.youtube.com/watch?v=${video?.id?.videoId}`,
          title: he.decode(video.snippet.title).trim(),
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
        .post("http://localhost:5000/api/v1/transcript/get-transcript", {
          url: video.url,
          lang: "de",
          timeout: 900000,
        })
        .catch((error) => {
          console.error(
            `Failed to fetch transcript for video ${video.url}:`,
            error.message
          );
          return { status: "rejected", reason: error };
        });
    });

    const transcriptsArr = await Promise.allSettled(transcriptPromises);

    // Process only successful transcript fetches
    const successfulTranscripts = transcriptsArr
      .map((result, idx) => {
        if (result.status === "fulfilled" && result.value?.data?.transcript) {
          const sanitizedTranscript = result.value.data.transcript.map(
            (item) => ({
              ...item,
              text: he.decode(item.text).trim(),
            })
          );
          return {
            transcript: sanitizedTranscript,
            videoIndex: idx,
          };
        }
        return null;
      })
      .filter(Boolean);

    const translateText = async (text) => {
      const maxRetries = 3;
      const retryDelay = 1000; // 1 second delay between retries

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const { data: translatedText } = await axios.post(
            "http://localhost:5000/api/v1/translate",
            { text },
            {
              timeout: 300000, // 30 seconds timeout
              headers: {
                "Content-Type": "application/json",
              },
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
      let processedCount = 0;
      const delayBetweenBatches = 500; // 500ms delay between batches

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        try {
          const batchResults = await Promise.allSettled(
            batch.map((textItem) => translateText(textItem.text))
          );

          const translatedBatch = batchResults.map((result) =>
            result.status === "fulfilled" ? result.value : null
          );

          batchedResults.push(...translatedBatch);
          processedCount += batch.length;

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

    // Process translations for each successful transcript
    const translationResults = await Promise.all(
      successfulTranscripts.map(async (successfulTranscript) => {
        const translatedTexts = await batchTranslate(
          successfulTranscript.transcript,
          3
        ); // Batch size 10

        // Combine original transcript data with translated text
        const translations = successfulTranscript.transcript.map(
          (item, index) => ({
            ...item,
            translatedText: translatedTexts[index], // Will be null if translation failed
          })
        );

        return {
          translations, // Array of {text, start, duration, translatedText}
          videoIndex: successfulTranscript.videoIndex,
        };
      })
    );

    // Process videos with successful transcripts and translations
    const videosWithTranscripts = videos
      .map((video, idx) => {
        const translationData = translationResults.find(
          (t) => t.videoIndex === idx
        );
        // Ensure translationData and its translations exist
        if (!translationData || !translationData.translations) return null;

        return {
          ...video,
          defaultCaptionData: {
            // Store the combined transcript and translation data
            transcript: translationData.translations,
            translatedTranscript: translationData.translations.map(
              (t) => t.translatedText
            ),
          },
        };
      })
      .filter(Boolean);

    // Save videos to database with reference to the channel
    const videosToSave = videosWithTranscripts.map((video) => {
      return {
        ...video,
        channelId: newChannel._id,
        topicOrder: topicOrder,
      };
    });

    // Insert all videos in a single batch operation
    await Video.insertMany(videosToSave);

    res.status(201).send({
      channel: newChannel,
      popularVideos: videosWithTranscripts,
      // translationResults,
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
