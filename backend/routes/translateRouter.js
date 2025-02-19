const { default: axios } = require("axios");
const express = require("express");
const router = express.Router();
const Reverso = require("reverso-api");

router.post("/", async (req, res, next) => {
  let { text } = req.body;
  const { targetLanguage, examples = false } = req.query;

  console.log(targetLanguage);
  if (examples) {
    const reverso = new Reverso();
    reverso.getTranslation(text, "german", "english", (err, response) => {
      if (err) {
        res.send(err.message);
        return;
      }
      res.send(response);
    });
  } else {
    try {
      const encodedText = encodeURIComponent(text);
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodedText}`;
      const response = await axios.get(url);
      const data = response.data[0].map((arr) => arr[0]);
      res.send(data.join(" "));
    } catch (err) {
      err;
      res.send(err.message);
    }
  }

  // const textParts = Math.ceil(text.length / 2000);
  // const arrOfNumbers = Array.from({ length: textParts }, (_, i) => i);
  // const textArr = [];

  // if (textParts === 1) {
  // const encodedText = encodeURIComponent(text);
  // const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodedText}`;
  // const response = await axios.get(url);
  // const data = response.data[0].map((arr) => arr[0]);
  // res.send(data.join(" "));

  // } else {
  //   for (let i in arrOfNumbers) {
  //     if (arrOfNumbers > 30) {
  //       await new Promise((resolve) => {
  //         setTimeout(resolve, 2000);
  //       });
  //     }
  //     setTimeout(async () => {}, 2000);
  //     const response = await fetch("https://libretranslate.com/translate", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         q: text,
  //         source: "auto",
  //         target: targetLanguage,
  //         format: "text",
  //         alternatives: 3,
  //         api_key: "",
  //       }),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const data = await response.json();

  //     ("data", data);
  //     textArr.push(" " + data.translatedText);
  //   }
  //   // (textArr);
  //   res.send(textArr.join(""));
  // }
});
module.exports = router;
