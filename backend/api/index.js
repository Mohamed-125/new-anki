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
const { faker } = require("@faker-js/faker");

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

// Mongo DB Connections
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then((response) => {
    console.log("MongoDB Connection Succeeded with SSL/TLS.");
  })
  .catch((error) => {
    console.log("Error in DB connection: " + error);
  });

const whitelist = [
  "https://new-anki-one.vercel.app",
  "http://localhost:5173",
  "chrome-extension://cbjhlfenceikgmdhffgcklhcfmjomojk",
  "chrome-extension://djlfoidjlgljkgpdnlglajpjigbgkdab",
  "http://192.168.1.2:5174",
  "http://192.168.1.2:5173",
  "http://192.168.1.3:5174",
  "http://192.168.1.3:5173",
  "http://localhost:5174",
];

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

const PORT = process.env.PORT || 5000;

const CardModel = require("../models/CardModel");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
 

app.get("/", (req, res) => res.send("server is running "));
app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
