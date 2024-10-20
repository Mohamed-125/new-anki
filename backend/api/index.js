const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../config.env") });
const userRouter = require("../routes/userRouter");
const collectionRouter = require("../routes/collectionRouter");
const cardRouter = require("../routes/cardRouter");
const videoRouter = require("../routes/videoRouter");
const playlistRouter = require("../routes/playlistRouter");
const translateRouter = require("../routes/translateRouter");
const channelsRouter = require("../routes/channelsRouter");
const noteRouter = require("../routes/noteRouter");
const textRouter = require("../routes/textRouter");
const cookieParser = require("cookie-parser");
const puppeteer = require("puppeteer");

// Mongo DB Connections

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then((response) => {
    ("MongoDB Connection Succeeded.");
  })
  .catch((error) => {
    "Error in DB connection: " + error;
  });

// Middleware Connections
app.use(
  cors({
    // origin: function (origin, callback) {
    //   const allowedOrigins = [
    //     "https://new-anki-one.vercel.app",
    //     // Vercel domain
    //     "http://localhost:5173", // Localhost domain
    //   ];
    //   // If there's no origin or the origin is in the allowed list, allow the request
    //   if (!origin || allowedOrigins.indexOf(origin) !== -1) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    origin: "https://new-anki-one.vercel.app", // Directly specify the frontend domain
    credentials: true, // Allow credentials (cookies, headers, etc.)
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
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/note", noteRouter);
app.use("/api/v1/translate", translateRouter);
app.use("/api/v1/channels", channelsRouter);
app.use("/api/v1/text", textRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API. Use /api/v1/ for available routes.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  "App running in port: " + PORT;
});
