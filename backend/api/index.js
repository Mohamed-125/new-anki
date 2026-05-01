const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const https = require("https");
const fs = require("fs");

// Apply TLS options to mongoose connection
require("dotenv").config({
  path: path.resolve(__dirname, "../config.env"),
});

const userRouter = require("../routes/userRouter");
const collectionRouter = require("../routes/collectionRouter");
const cardRouter = require("../routes/cardRouter");
const videoRouter = require("../routes/videoRouter");
const playlistRouter = require("../routes/playlistRouter");
const translateRouter = require("../routes/translateRouter");
const channelsRouter = require("../routes/channelsRouter");
const noteRouter = require("../routes/noteRouter");
const textRouter = require("../routes/textRouter");
const courseRouter = require("../routes/courseRouter");
const sectionRouter = require("../routes/sectionRouter");
const courseLevelRouter = require("../routes/courseLevelRouter.js");
const lessonRouter = require("../routes/lessonRouter");
const progressRouter = require("../routes/progressRouter.js");
const transcriptRouter = require("../routes/transcriptRouter.js");
const topicRouter = require("../routes/topicRouter");
const conjugationRouter = require("../routes/conjugationRouter");
const listRouter = require("../routes/listRouter");
const cookieParser = require("cookie-parser");
const CourseModel = require("../models/CourseModel.js");
const CourseLevel = require("../models/CourseLevelModel.js");
const Lesson = require("../models/LessonModel.js");
const Section = require("../models/SectionModel.js");
const { decode } = require("he");
const LessonModel = require("../models/LessonModel.js");
const SectionModel = require("../models/SectionModel.js");

const whitelist = [
  "https://new-anki-one.vercel.app",
  "http://localhost:5173",
  "https://localhost:5173",
  "chrome-extension://cbjhlfenceikgmdhffgcklhcfmjomojk",
  "chrome-extension://djlfoidjlgljkgpdnlglajpjigbgkdab",
  "http://192.168.1.2:5174",
  "http://192.168.1.2:5173",
  "http://192.168.1.3:5174",
  "http://192.168.1.3:5173",
  "http://localhost:5174",
  "https://localhost:4173",
];
const connectDB = require("../lib/db.js");

connectDB();
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
// app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "50mb" })); // Increase JSON body size limit
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Routes
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/collection", collectionRouter);
app.use("/api/v1/card", cardRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/note", noteRouter);
app.use("/api/v1/translate", translateRouter);
app.use("/api/v1/conjugation", conjugationRouter);
app.use("/api/v1/channel", channelsRouter);
app.use("/api/v1/text", textRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/courseLevel", courseLevelRouter);
app.use("/api/v1/section", sectionRouter);
app.use("/api/v1/lesson", lessonRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/transcript", transcriptRouter);
app.use("/api/v1/topic", topicRouter);
app.use("/api/v1/scrape-conjugations", conjugationRouter);
app.use("/api/v1/list", listRouter);

/**
 * ✅ LOCAL DEVELOPMENT ONLY
 */
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log("App running in port:", PORT);
  });
}

app.get("/", (req, res) => res.send("server is running"));
module.exports = app;
