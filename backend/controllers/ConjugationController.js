const axios = require("axios");
const cheerio = require("cheerio");
const languageCodeMap = {
  en: "english",
  es: "spanish",
  fr: "french",
  de: "german",
  it: "italian",
  pt: "portuguese",
  nl: "dutch",
  pl: "polish",
  ru: "russian",
  ja: "japanese",
  zh: "chinese",
  ar: "arabic",
  he: "hebrew",
  tr: "turkish",
  sv: "swedish",
  ro: "romanian",
  cs: "czech",
  el: "greek",
  fi: "finnish",
  hu: "hungarian",
  uk: "ukrainian",
  // Add more languages as needed
};
const scrapeConjugations = async (req, res) => {
  try {
    const { word, language } = req.body;

    if (!word || !language) {
      return res.status(400).send("Word and language are required");
    }

    const wordWithOutSpace = word.trim();
    const url = `https://conjugator.reverso.net/conjugation-${languageCodeMap[language]}-verb-${wordWithOutSpace}.html`;

    console.log("url", url);

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://conjugator.reverso.net",
        "sec-ch-ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1",
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);

    console.log($(".unknown-word-warning").length > 0);
    // 🛑 Check if it's an unknown verb
    if ($(".unknown-word-warning").length > 0) {
      return res.status(404).json({
        error: "Unknown verb – no conjugation available for this word.",
      });
    }

    const conjugations = [];

    $(".blue-box-wrap").each((i, tenseSection) => {
      const tense = $(tenseSection).attr("mobile-title");
      const conjugationList = [];

      $(tenseSection)
        .find("i.graytxt")
        .each((j, personElement) => {
          const person = $(personElement).text().trim();
          const form = $(personElement).next().text().trim();

          if (person && form) {
            conjugationList.push({ person, form });
          }
        });

      if (conjugationList.length > 0) {
        conjugations.push({
          tense,
          conjugations: conjugationList,
        });
      }
    });

    if (conjugations.length === 0) {
      return res
        .status(404)
        .json({ error: "No conjugations found for this verb." });
    }

    res.json(conjugations);
  } catch (error) {
    console.error("Error scraping conjugations:", error);
    res.status(500).json({ error: "Failed to fetch conjugations." });
  }
};

module.exports = {
  scrapeConjugations,
};
