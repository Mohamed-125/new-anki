const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
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
const cookieParser = require("cookie-parser");
const CourseModel = require("../models/CourseModel.js");
const CourseLevel = require("../models/CourseLevelModel.js");
const Lesson = require("../models/LessonModel.js");
const Section = require("../models/SectionModel.js");

// Mongo DB Connections
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
app.use("/api/v1/channel", channelsRouter);
app.use("/api/v1/text", textRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/courseLevel", courseLevelRouter);
app.use("/api/v1/section", sectionRouter);
app.use("/api/v1/lesson", lessonRouter);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/transcript", transcriptRouter);
app.use("/api/v1/topic", topicRouter);
app.use("/api/v1/topic", topicRouter);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => res.send("server is running "));
app.listen(PORT, () => {
  console.log("App running in port: " + PORT);
});
const seedDatabase = async () => {
  try {
    await CourseModel.deleteMany();
    await CourseLevel.deleteMany();
    await Lesson.deleteMany();
    await Section.deleteMany();

    console.log("Database cleared...");

    // 1. Create Courses
    const coursesData = [
      {
        name: "German Course",
        lang: "German",
        flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg",
      },
    ];

    const courses = await CourseModel.insertMany(coursesData);
    console.log(
      "Courses created:",
      courses.map((c) => c.name)
    );

    // 2. Create Levels
    const levels = [];
    const levelNames = ["A1", "A2", "B1", "B2"];

    for (const course of courses) {
      levelNames.forEach((level) => {
        levels.push({
          name: level,
          description: `This is the ${level} level of the ${course.name}.`,
          courseId: course._id,
        });
      });
    }

    const courseLevels = await CourseLevel.insertMany(levels);
    console.log(
      "Levels created:",
      courseLevels.map((l) => l.name)
    );

    // 3. Define Lessons by CEFR Levels
    const lessonTopicsByLevel = {
      A1: [
        "Begrüßungen und Verabschiedungen",
        "Zahlen und Uhrzeit",
        "Familie und Freunde",
        "Essen und Getränke",
        "Tagesablauf",
        "Hobbys und Freizeit",
        "Einkaufen und Preise",
        "Wegbeschreibung",
        "Wetter und Jahreszeiten",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
        "Berufe und Arbeit",
      ],
      A2: [
        "Vergangenheit und Erlebnisse",
        "Gesundheit und Arztbesuche",
        "Mein Zuhause",
        "Reisen und Urlaub",
        "Medien und Technologie",
        "Kleidung und Mode",
        "Feste und Feiertage",
        "Verkehrsmittel",
        "Berufswelt",
        "Gefühle und Emotionen",
      ],
      B1: [
        "Umwelt und Nachhaltigkeit",
        "Gesellschaft und Politik",
        "Arbeit und Karriere",
        "Gesund leben",
        "Kunst und Kultur",
        "Technologische Entwicklungen",
        "Sport und Bewegung",
        "Migration und Integration",
        "Zwischenmenschliche Beziehungen",
        "Psychologie und Persönlichkeit",
      ],
      B2: [
        "Wissenschaft und Forschung",
        "Philosophie und Ethik",
        "Geschichte Deutschlands",
        "Wirtschaft und Finanzen",
        "Gesundheitspolitik",
        "Technologie der Zukunft",
        "Umweltkrisen und Lösungen",
        "Literatur und deutsche Autoren",
        "Politische Systeme",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
        "Berufliche Weiterentwicklung",
      ],
    };

    // 4. Generate Lessons
    const lessonsData = [];
    for (const level of courseLevels) {
      const topics = lessonTopicsByLevel[level.name] || [];
      topics.forEach((topic) => {
        lessonsData.push({
          name: topic,
          type: "lesson",
          content: faker.lorem.paragraphs(2),
          courseLevelId: level._id,
          img: faker.image.urlLoremFlickr({ category: "education" }),
          audio: faker.internet.url(),
          video: faker.internet.url(),
        });
      });
    }

    const lessons = await Lesson.insertMany(lessonsData);
    console.log(
      "Lessons created:",
      lessons.map((l) => l.name)
    );

    // 5. Create Sections
    const youtubeResources = [
      "https://www.youtube.com/watch?v=R1v3O_0Fum4",
      "https://www.youtube.com/watch?v=D9w4VLw2fm0",
      "https://www.youtube.com/watch?v=ZpFhDkXTSro",
      "https://www.youtube.com/watch?v=F5X4bHG1Zj8",
    ];

    const sectionsData = lessons.flatMap((lesson) => [
      {
        name: "Reading Text",
        type: "text",
        content: `Hier ist ein Beispieltext für das Thema '${
          lesson.name
        }'. ${faker.lorem.paragraphs(3)}`,
        lessonId: lesson._id,
      },
      {
        name: "Grammar Explanation",
        type: "text",
        content: `Die Grammatik zu '${
          lesson.name
        }' ist folgendes: ${faker.lorem.sentences(3)}`,
        lessonId: lesson._id,
      },
      {
        name: "Exercises",
        type: "excercises",
        content: {
          questions: [
            {
              question: `Was bedeutet '${lesson.name}'?`,
              choices: ["Option 1", "Option 2", "Option 3", "Option 4"],
              answer: "2",
              type: "choose",
              id: Math.random(),
            },
            {
              question: `Schreiben Sie einen Satz mit '${lesson.name}'.`,
              answer: "",
              type: "text",
              id: Math.random(),
            },
          ],
        },
        lessonId: lesson._id,
      },
      {
        name: "Resources",
        type: "resources",
        content: {
          resourses: youtubeResources
            .sort(() => 0.5 - Math.random())
            .slice(0, 2),
        },
        lessonId: lesson._id,
      },
    ]);

    const sections = await Section.insertMany(sectionsData);
    console.log("Sections created:", sections.length);

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

// seedDatabase();
