const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");

const languageCodeMapShort = {
  en: "eng", // English
  es: "spa", // Spanish
  fr: "fre", // French
  de: "ger", // German
  it: "ita", // Italian
  pt: "por", // Portuguese
  nl: "dut", // Dutch
  pl: "pol", // Polish
  ru: "rus", // Russian
  ja: "jpn", // Japanese
  zh: "chi", // Chinese
  ar: "ara", // Arabic
  he: "heb", // Hebrew
  tr: "tur", // Turkish
  sv: "swe", // Swedish
  ro: "rum", // Romanian
  cs: "cze", // Czech
  el: "gre", // Greek
  fi: "fin", // Finnish
  hu: "hun", // Hungarian
  uk: "ukr", // Ukrainian
  // Add more as needed based on Reverso's internal code usage
};
// Language code mapping for Reverso Context
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

const puppeteer = require("puppeteer");
router.post("/", async (req, res, next) => {
  try {
    const { text } = req.body;
    const { targetLanguage = "en" } = req.query;

    // Input validation
    if (!text || typeof text !== "string") {
      return res
        .status(400)
        .json({ error: "Text is required and must be a string" });
    }
    if (!targetLanguage || !languageCodeMap[targetLanguage]) {
      return res
        .status(400)
        .json({ error: "Valid target language is required" });
    }

    // Extract the word within double parentheses and preserve the structure
    const regex = /\(\((.*?)\)\)/;
    const originalWordMatch = text.match(regex);
    const originalWord = originalWordMatch ? originalWordMatch[1] : null;

    // Split text into parts to translate separately and maintain structure
    let textParts = [];
    let currentIndex = 0;

    if (originalWordMatch) {
      const matchIndex = text.indexOf(originalWordMatch[0]);
      if (matchIndex > 0) {
        textParts.push(text.substring(0, matchIndex));
      }
      textParts.push(originalWordMatch[1]); // Add the content within parentheses
      if (matchIndex + originalWordMatch[0].length < text.length) {
        textParts.push(
          text.substring(matchIndex + originalWordMatch[0].length)
        );
      }
    } else {
      textParts.push(text);
    }

    // Translate each part separately
    const translatedParts = await Promise.all(
      textParts.map(async (part) => {
        const encodedPart = encodeURIComponent(part);
        const translationUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodedPart}`;

        const response = await axios.get(translationUrl);
        if (!response.data || !Array.isArray(response.data[0])) {
          throw new Error("Invalid translation response format");
        }

        return response.data[0]
          .map((item) => item && item[0])
          .filter(Boolean)
          .join("");
      })
    );

    // Reconstruct the translated text with preserved structure
    let translatedText = "";
    let translatedWord = null;

    if (originalWordMatch) {
      translatedWord = translatedParts[1]; // The translated content within parentheses
      translatedText = translatedParts[0] || ""; // Before parentheses
      translatedText += `((${translatedWord}))`; // Add parentheses back
      translatedText += translatedParts[2] || ""; // After parentheses
    } else {
      translatedText = translatedParts[0];
    }

    // Format response
    const response = {
      originalText: text,
      translatedText,
      originalWord,
      translatedWord,
    };

    res.json(response);
  } catch (err) {
    console.error("Translation error:", err);
    res.status(err.response?.status || 500).json({
      error: "Translation failed",
      message: err.message,
    });
  }
});

// Route to translate text and get examples
router.post("/translate-examples", async (req, res) => {
  try {
    const { text } = req.body;
    const { language = "de", targetLanguage = "ar" } = req.query;

    if (!text) return res.status(400).json({ error: "Text is required." });
    let translations = [];

    // Create translation URL
    let encodedText = encodeURIComponent(text);
    let sourceCode = languageCodeMapShort[language] || "ger";
    let targetCode = languageCodeMapShort[targetLanguage] || "eng";
    let url = `https://www.reverso.net/text-translation#sl=${sourceCode}&tl=${targetCode}&text=${encodedText}`;

    console.log(sourceCode, targetCode, targetLanguage);
    // Launch Puppeteer and scrape the results
    let browser = await puppeteer.launch({
      headless: false,
    });

    let page = await browser.newPage();

    let examples = [];

    try {
      await page.goto(url);
      // Wait for the translation result to appear

      console.log("waiting");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("waiting finished");

      let translationDiv = await page.$(".translation-input__result");

      if (translationDiv) {
        // If the div exists, get the value of the textarea inside it
        let textareaValue = await page.$eval(
          ".translation-input__result textarea",
          (el) => el.value
        );
        translations.push(textareaValue);
        // You can return or use this value as needed
      }
    } catch (err) {
      let scrapedTranslations = await page.$$eval(
        ".text__translation",
        (spans) => spans.map((span) => span.textContent.trim())
      );

      translations = scrapedTranslations;
      console.log("more than one translation found", scrapedTranslations);
    }

    // Scrape examples
    try {
      let scrapedExamples = await page.$$eval(".example", (exampleDivs) => {
        return exampleDivs.map((div) => {
          let source =
            div.querySelector(".src, .source")?.textContent.trim() || "";
          let target =
            div.querySelector(".trg, .target")?.textContent.trim() || "";
          return { source, target };
        });
      });

      examples.push(...scrapedExamples);
      console.log("exapmles found", examples);
    } catch (err) {
      console.error("Example scraping error:", err.message);
    }

    await browser.close();

    return res.send({ examples, translations: translations.join(",") });
  } catch (error) {
    console.error("Scraping error:", error);
    return res.status(500).json({ error: "Failed to fetch translations." });
  }
});

router.post("/translate-word", async (req, res) => {
  const { text } = req.body;
  const { language = "de", targetLanguage = "en" } = req.query;

  try {
    // Linguee uses URLs like this: /german-english/search?query=gehen
    const url = `https://www.linguee.com/${languageCodeMap[language]}-${
      languageCodeMap[targetLanguage]
    }/search?query=${encodeURIComponent(text)}`;

    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let translations = [];
    let examples = [];

    // Translation words
    $(".exact .dictLink").each((i, el) => {
      const word = $(el).text().trim();
      if (word && !translations.includes(word)) {
        translations.push(word);
      }
    });

    // Example sentence pairs
    $(".example").each((i, el) => {
      const source = $(el).find(".src").text().trim();
      const target = $(el).find(".trg").text().trim();
      if (source && target) {
        examples.push({ source, target });
      }
    });
    res.json({
      word: text,
      translations: translations.slice(1, 4), // limit to top 10
      examples: examples.slice(0, 4), // limit to top 5
    });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Failed to fetch translation." });
  }
});

module.exports = router;
