const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../config.env") });
const userRouter = require("./routes/userRouter");
const collectionRouter = require("./routes/collectionRouter");
const cardRouter = require("./routes/cardRouter");
const videoRouter = require("./routes/videoRouter");
const cookieParser = require("cookie-parser");

const translate = require("google-translate-api-x");
const { default: axios } = require("axios");

// Mongo DB Connections

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then((response) => {
    console.log("MongoDB Connection Succeeded.");
  })
  .catch((error) => {
    console.log("Error in DB connection: " + error);
  });

// Middleware Connections
app.use(
  cors({
    origin: true, // Reflect the request origin
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/collection", collectionRouter);
app.use("/api/v1/card", cardRouter);
app.use("/api/v1/video", videoRouter);

// Connection
const PORT = process.env.PORT || 5000;

app.post("/api/v1/translate", async (req, res, next) => {
  let { text } = req.body;
  const { targetLanguage } = req.query;

  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodedText}`;

    const responese = await axios.get(url);
    console.log(responese.data);
    const data = responese.data[0].map((arr) => arr[0]);
    res.send(data.join(" "));
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

// app.post("/api/v1/translate", async (req, res, next) => {
//   const { text } = req.body;
//   try {
//     const responese = await translate(text, { to: "en" });
//     console.log(responese);
//     res.send(responese.text);
//   } catch (err) {
//     console.log(err);
//     res.send(err.message);
//   }
// });

app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
