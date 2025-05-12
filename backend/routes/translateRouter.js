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
  let { text } = req.body;
  const { targetLanguage } = req.query;

  try {
    // Extract the word within double parentheses
    const regex = /\(\((.*?)\)\)/;
    const originalWordMatch = text.match(regex);
    let originalWord = null;

    if (originalWordMatch && originalWordMatch[1]) {
      originalWord = originalWordMatch[1];
    }

    const encodedText = encodeURIComponent(text);
    const translationUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodedText}`;
    const translationResponse = await axios.get(translationUrl);
    function extractParenthesesText(data) {
      const results = [];

      function search(item) {
        if (typeof item === "string") {
          // Match anything between two parentheses (including double)
          const matches = item.match(/\(?\(([^()]+)\)\)?/g);
          if (matches) {
            for (const match of matches) {
              // Remove outer parentheses
              const clean = match.replace(/^\(?\(/, "").replace(/\)?\)$/, "");
              results.push(clean);
            }
          }
        } else if (Array.isArray(item)) {
          for (const element of item) {
            search(element);
          }
        } else if (typeof item === "object" && item !== null) {
          for (const key in item) {
            search(item[key]);
          }
        }
      }

      search(data);
      return results;
    }

    // Extract translated word from the response
    const translatedWordMatch = "hey".match(regex);
    let translatedWord = null;

    if (translatedWordMatch && translatedWordMatch[1]) {
      translatedWord = translatedWordMatch[1];
    }

    res.json({
      data: translationResponse.data,
      translation: extractParenthesesText(translationResponse.data)[0],
    });
  } catch (err) {
    console.log("translate router error", err.message);
    res.status(500).send(err.message);
  }
});

// Route to translate text and get examples
router.post("/translate-examples", async (req, res) => {
  try {
    const { text } = req.body;
    const { language = "de", targetLanguage = "en" } = req.query;

    if (!text) return res.status(400).json({ error: "Text is required." });

    // Create translation URL
    let encodedText = encodeURIComponent(text);
    let sourceCode = languageCodeMapShort[language] || "ger";
    let targetCode = languageCodeMapShort[targetLanguage] || "eng";
    let url = `https://www.reverso.net/text-translation#sl=${sourceCode}&tl=${targetCode}&text=${encodedText}`;

    // Launch Puppeteer and scrape the results
    let browser = await puppeteer.launch({ headless: false });

    let page = await browser.newPage();
    await page.goto(url);
    let translations = [];
    let examples = [];
    try {
      await page.waitForTimeout(1000);
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
      let translations = await page.$$eval(".text__translation", (spans) =>
        spans.map((span) => span.textContent.trim())
      );
      translations = translations;
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
    } catch (err) {
      console.error("Example scraping error:", err.message);
    }

    console.log(translations);
    await browser.close();

    return res.send([examples, translation]);
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
