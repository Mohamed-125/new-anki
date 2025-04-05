const { YoutubeTranscript } = require("youtube-transcript");
const asyncHandler = require("express-async-handler");
const axios = require("axios");
const cheerio = require("cheerio");
/**
 * Extract YouTube video ID from various URL formats
 * @param {string} url - YouTube video URL
 * @returns {string|null} - YouTube video ID or null if invalid
 */
const extractYoutubeVideoId = (url) => {
  if (!url) return null;

  // Handle different YouTube URL formats
  const regexPatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/watch\?.*v=)([^&?\n]+)/,
    /youtube\.com\/shorts\/([^&?\n]+)/,
  ];

  for (const pattern of regexPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If the input is already a video ID (11 characters)
  if (/^[\w-]{11}$/.test(url)) {
    return url;
  }

  return null;
};

/**
 * Get transcript for a YouTube video
 * @route POST /api/transcript/get-transcript
 * @access Public
 */
module.exports.getTranscript = asyncHandler(async (req, res) => {
  const { url, videoId: providedVideoId, lang = "en" } = req.body;

  // Get video ID either from direct input or by extracting from URL
  const videoId = providedVideoId || extractYoutubeVideoId(url);

  if (!videoId) {
    return res.status(400).json({
      success: false,
      message: "Invalid YouTube URL or video ID",
    });
  }

  try {
    // Check if transcript already exists in database

    // Fetch transcript using youtube-transcript library
    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
      lang,
    });

    if (!transcriptData || transcriptData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transcript available for this video",
      });
    }

    // Format transcript data to match our schema
    const formattedTranscript = transcriptData.map((item) => ({
      text: item.text,
      start: item.start,
      duration: item.duration,
    }));

    const translateText = async (text) => {
      const { data: translatedText } = await axios.post(
        "https://new-anki-server.vercel.app/api/v1/translate",
        // "http://localhost:5000/api/v1/translate",
        { text }
        // { signal: newController.signal }
      );
      return translatedText;
    };

    const batchTranslate = async (texts, batchSize) => {
      const batchedResults = [];
      let processedCount = 0;

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const translatedBatch = await Promise.all(
          batch.map((text) => translateText(text.text))
        );
        batchedResults.push(...translatedBatch);
        processedCount += batch.length;
      }
      return batchedResults;
    };

    // const translatedTranscript = await batchTranslate(formattedTranscript, 20);
    const translatedTranscript = [];

    const { title, thumbnail } = await axios
      .get(url)
      .then(async (response) => {
        const $ = cheerio.load(response.data);
        let title = $("title").text();
        let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        return { title, thumbnail };
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          throw new Error("Operation cancelled");
        }
        console.log(err);
        throw err;
      });

    return res.status(200).send({
      translatedTranscript,
      transcript: formattedTranscript,
      title,
      thumbnail,
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transcript",
      error: error.message,
    });
  }
});
