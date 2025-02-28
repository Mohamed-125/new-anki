const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
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
const cookieParser = require("cookie-parser");

// Mongo DB Connections
console.log(process.env.MONGO_DB_URL);
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then((response) => {
    console.log("MongoDB Connection Succeeded.");
  })
  .catch((error) => {
    console.log("Error in DB connection: " + error);
  });

const whitelist = [
  "https://new-anki-one.vercel.app",
  "http://localhost:5173",
  "http://192.168.1.2:5174",
  "http://192.168.1.2:5173",
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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow credentials like cookies
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" })); // Increase JSON body size limit
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Ensure OPTIONS requests are handled properly
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(200).json({});
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

app.get("/", (req, res) => res.send("server is running "));
app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
