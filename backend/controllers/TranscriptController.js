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

  console.log("get transcrpit works here is the url: ", url);
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
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang,
    });

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No transcript available for this video",
      });
    }

    console.log("transcript", transcript);

    // Get video title
    const { title } = await axios
      .get(url)
      .then(async (response) => {
        const $ = cheerio.load(response.data);
        return { title: $("title").text() };
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          throw new Error("Operation cancelled");
        }
        console.log(err);
        throw err;
      });

    // Try different thumbnail resolutions
    const thumbnailResolutions = [
      "maxresdefault",
      "hqdefault",
      "mqdefault",
      "default",
    ];
    let thumbnail = null;

    for (const resolution of thumbnailResolutions) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${resolution}.jpg`;
      try {
        const response = await axios.head(thumbnailUrl);
        if (response.status === 200) {
          thumbnail = thumbnailUrl;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    // Fallback to default thumbnail if none are available
    if (!thumbnail) {
      thumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`;
    }

    return res.status(200).send({
      transcript,
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
