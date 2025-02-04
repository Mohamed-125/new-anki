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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json()); // To parse JSON data
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded data
app.use(cookieParser()); // For parsing cookies

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then((response) => {
    ("MongoDB Connection Succeeded.");
  })
  .catch((error) => {
    "Error in DB connection: " + error;
  });

const whitelist = [
  "https://new-anki-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://192.168.1.5:5173",
  "http://192.168.1.5:5174",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow OPTIONS method
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  credentials: true, // Allow credentials (cookies, headers, etc.)
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions)); // Handle preflight requests for all routes

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.sendStatus(204); // Respond to OPTIONS preflight with 'No Content'
  } else {
    next();
  }
});

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  "App running in port: " + PORT;
});
