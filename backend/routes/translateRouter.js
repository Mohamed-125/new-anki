const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
const Word = require("../models/WordModel");
const WordsMissing = require("../models/WordsMissingModel");

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
    const { targetLanguage = "en", language = "de" } = req.query;
    // Extract the word within double parentheses and preserve the structure
    const regex = /\(\((.*?)\)\)/;
    const originalWordMatch = text.match(regex);
    const cleanText = (text) => text.replace(/[^\p{L}\s]/gu, "").trim();
    const originalWord = originalWordMatch
      ? cleanText(originalWordMatch[1])
      : null;

    // Extract and check dictionary for text between double parentheses
    const doubleParenRegex = /\(\((.*?)\)\)/;
    const match = text.match(doubleParenRegex);
    // Clean the text by removing punctuation and special characters
    const searchText = cleanText(match ? match[1] : text);

    console.log("Search Text:", searchText);
    const searchRegex = new RegExp(
      `^${searchText.replace(/ß/g, "(ß|ss)")}$`,
      "i"
    );

    try {
      const dictionaryMatch = await Word.findOne({
        $or: [
          { lemma: searchRegex },
          { "base.singular": searchRegex },
          { "base.plural": searchRegex },
          { variants: searchRegex },
        ],
      }).lean();

      if (dictionaryMatch) {
        const translations = dictionaryMatch.translations[targetLanguage] || [];

        console.log("translations", translations);
        if (translations.length > 0) {
          return res.json({
            originalText: text,
            word: dictionaryMatch,
            fromDatabase: true,
          });
        } else {
          console.log(
            "No translations found in the database for target language:",
            targetLanguage
          );
        }
      } else {
        console.log("Word not found in the database:", searchText);
        // If word not found in dictionary, save to WordsMissing collection
        if (originalWord && originalWord.split(" ").length === 1) {
          try {
            const result = await WordsMissing.findOneAndUpdate(
              { word: searchText, language },
              { $setOnInsert: { word: searchText, language } },
              { upsert: true, new: true }
            );
            console.log("Saved missing word:", result);
          } catch (error) {
            // If error is not due to duplicate entry, log it
            if (error.code !== 11000) {
              console.error("Error saving missing word:", error);
            } else {
              console.log(
                "Duplicate missing word entry:",
                searchText,
                language
              );
            }
          }
        }
      }
    } catch (err) {
      console.log("error when getting the dictionary match", err);
    }

    // Input validation
    if (!text || typeof text !== "string") {
      const errorMessage = "Text is required and must be a string";
      console.error("Validation Error:", errorMessage);
      return res.status(400).json({ error: errorMessage });
    }
    if (!targetLanguage || !languageCodeMap[targetLanguage]) {
      const errorMessage = "Valid target language is required";
      console.error("Validation Error:", errorMessage, targetLanguage);
      return res.status(400).json({ error: errorMessage });
    }

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

        try {
          const response = await axios.get(translationUrl);
          if (!response.data || !Array.isArray(response.data[0])) {
            const errorMessage = "Invalid translation response format";
            console.error(
              "Translation API Error:",
              errorMessage,
              response.data
            );
            throw new Error(errorMessage);
          }

          return response.data[0]
            .map((item) => item && item[0])
            .filter(Boolean)
            .join("");
        } catch (error) {
          console.error("Error fetching translation:", error);
          throw error; // Re-throw the error to be caught by the main try-catch
        }
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

    // For German words, try to get article and plural form
    let base = null;

    if (
      language === "de" &&
      originalWord &&
      originalWord.split(" ").length === 1
    ) {
      try {
        // Try with different articles
        const articles = ["das", "die", "der"];
        let foundArticlePage = null;

        for (const article of articles) {
          try {
            const articleUrl = `https://der-artikel.de/${article}/${originalWord.trim()}.html`;
            console.log("Fetching article page:", articleUrl);
            const response = await axios.get(articleUrl);
            foundArticlePage = response.data;
            break;
          } catch (error) {
            console.log(
              "Error fetching article page:",
              `https://der-artikel.de/${article}/${originalWord.trim()}.html`,
              error.message
            );
            continue;
          }
        }

        if (foundArticlePage) {
          console.log("Article page found for:", originalWord);
          const $ = cheerio.load(foundArticlePage);
          const table = $("table");
          if (table.length > 0) {
            const firstRow = table.find("tbody tr").first();
            const cells = firstRow.find("td");
            if (cells.length >= 3) {
              base = {
                singular: cells.eq(1).text().trim().replace("  ", " "),
                plural: cells.eq(2).text().trim().replace("  ", " "),
              };
              console.log("Base forms found:", base);
            } else {
              console.log("Less than 3 cells in the first table row.");
            }
          } else {
            console.log("No table found on the article page.");
          }
        } else {
          console.log("Article page not found for:", originalWord);
        }
      } catch (error) {
        console.error("Error fetching German word details:", error);
      }
    }

    // Format response
    const response = {
      originalText: text,
      translatedText,
      originalWord,
      translatedWord,
      base,
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
      let scrapedExamples = await page.$$eval(
        "#examples-content .example",
        (exampleDivs) => {
          return exampleDivs.map((div) => {
            let source =
              div.querySelector(".src.ltr .text")?.textContent.trim() || "";
            let target =
              div.querySelector(".trg.ltr .text")?.textContent.trim() || "";
            return { source, target };
          });
        }
      );

      examples.push(...scrapedExamples);
      console.log("examples found", examples);
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
