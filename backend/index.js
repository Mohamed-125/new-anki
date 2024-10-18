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
const playlistRouter = require("./routes/playlistRouter");
const translateRouter = require("./routes/translateRouter");
const channelsRouter = require("./routes/channelsRouter");
const noteRouter = require("./routes/noteRouter");
const textRouter = require("./routes/textRouter");
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
    origin: function (origin, callback) {
      const allowedOrigins = [
        "https://new-anki-ia08i8ocl-mohameds-projects-220dfc63.vercel.app", // Vercel domain
        "http://localhost:5173", // Localhost domain
      ];
      // If there's no origin or the origin is in the allowed list, allow the request
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

//scraper routes

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     args: ["--start-maximized"],
//     slowMo: 50,
//     defaultViewport: { width: 1920, height: 1080 },
//   });

//   const page = await browser.newPage();
//   await page.goto("https://www.languagereactor.com/m/yt_de_-");

//   const button = await page.waitForSelector(".MuiButton-root span");
//   await button.click();

//   // Function to handle scrolling and data extraction
//   async function scrollAndExtract() {
//     const channelsSelector =
//       "ul:nth-of-type(2) div.MuiButtonBase-root, ul:nth-of-type(3) div.MuiButtonBase-root";

//     // Wait for the page to load

//     await page.waitForSelector("ul:nth-of-type(2) div.MuiButtonBase-root");
//     // await new Promise((r) => setTimeout(r, 600)); // Wait for the new content to load

//     let channelsData = {};

//     const channels = (await page.$$(channelsSelector)).slice(0, 120);

//     for (const channel of channels) {
//       ("items in each loop channel change", channelsData);
//       const { channelName, channelVideosNum, channelThumbnail } =
//         await page.evaluate(async (channel) => {
//           (channel);
//           channel.click();
//           await new Promise((r) => setTimeout(r, 1600)); // Wait for the new content to load
//           return {
//             channelName: channel.children[1].textContent,
//             channelVideosNum: channel.children[2].textContent,
//             channelThumbnail: channel.children[0].children[0].children[0].src,
//           };
//         }, channel);

//       channelsData[channelName] = {
//         channelName,
//         channelVideosNum,
//         channelThumbnail,
//         items: [],
//       };

//       while (true) {
//         const scrollContainerHandle = await page.evaluateHandle(() =>
//           document.querySelector("[data-test-id='virtuoso-scroller']")
//         );

//         // Scroll down until the end of the list is reached

//         let { scrollTop, clientHeight, scrollHeight } = await page.evaluate(
//           async (scrollContainer) => {
//             // await new Promise((r) => setTimeout(r, 500)); // Wait for the new content to load

//             // if (!scrollContainer) {
//             //   throw new Error("Scroll container not found!");
//             // }

//             const scrollContainerData = {
//               scrollTop: scrollContainer?.scrollTop,
//               scrollHeight: scrollContainer?.scrollHeight,
//               clientHeight: scrollContainer?.clientHeight,
//             };

//             // ("data", data);

//             return scrollContainerData;
//           },
//           scrollContainerHandle
//         );

//         // Extract the currently rendered items
//         const visibleItems = await page.evaluate((channelName) => {
//           const links = Array.from(
//             document.querySelectorAll(
//               "[data-test-id='virtuoso-scroller'] [data-item-index] a"
//             )
//           );

//           const thumbnails = Array.from(
//             document.querySelectorAll(
//               "[data-test-id='virtuoso-scroller'] [data-item-index] .MuiListItemAvatar-root div div"
//             )
//           );

//           const titles = Array.from(
//             document.querySelectorAll(
//               "[data-test-id='virtuoso-scroller'] [data-item-index] a"
//             )
//           );

//           const durations = Array.from(
//             document.querySelectorAll(
//               "[data-test-id='virtuoso-scroller'] [data-item-index] .MuiListItemAvatar-root span"
//             )
//           );

//           const visibleItems = links.map((link, index) => {
//             (
//               titles[index].children[1].children[0].children[0].children[0]
//                 .children[0].textContent
//             );
//             return {
//               href: link.href,
//               thumbnail: thumbnails[index].style.backgroundImage,
//               title:
//                 titles[index].children[1].children[0].children[0].children[0]
//                   .children[0].textContent,
//               duration: durations[index].textContent,
//             };
//           });

//           return visibleItems;
//         }, channelName);

//         // ("visibleItems", visibleItems);
//         channelsData[channelName].items = [
//           ...channelsData[channelName].items,
//           ...visibleItems,
//         ];

//         if (
//           Math.ceil(scrollTop + clientHeight) >= scrollHeight ||
//           Math.ceil(scrollTop + clientHeight) >= 60834
//         ) {
//           ("breaking");
//           break;
//         } else {
//           // Scroll down
//           await page.evaluate((scrollContainer) => {
//             if (scrollContainer) {
//               scrollContainer.scrollTop += scrollContainer.clientHeight;
//             }
//           }, scrollContainerHandle);

//           new Promise((r) => setTimeout(r, 400)); // Wait for the new content to load
//         }
//       }

//       // // Extract the final batch of items
//       // const finalItems = await page.evaluate((channelName) => {
//       //   const links = Array.from(
//       //     document.querySelectorAll(
//       //       "[data-test-id='virtuoso-scroller'] [data-item-index] a"
//       //     )
//       //   );

//       //   const thumbnails = Array.from(
//       //     document.querySelectorAll(
//       //       "[data-test-id='virtuoso-scroller'] [data-item-index] .MuiListItemAvatar-root div div"
//       //     )
//       //   );

//       //   const titles = Array.from(
//       //     document.querySelectorAll(
//       //       "[data-test-id='virtuoso-scroller'] [data-item-index] a"
//       //     )
//       //   );

//       //   const durations = Array.from(
//       //     document.querySelectorAll(
//       //       "[data-test-id='virtuoso-scroller'] [data-item-index] .MuiListItemAvatar-root span"
//       //     )
//       //   );

//       //   const finalItems = links.map((link, index) => ({
//       //     href: link.href,
//       //     thumbnail: thumbnails[index].style.backgroundImage,
//       //     title:
//       //       titles[index].children[1].children[0].children[0].children[0]
//       //         .children[0].textContent,
//       //     duration: durations[index].textContent,
//       //   }));

//       //   return finalItems;
//       // }, channelName);

//       // // // ("items", items);
//       // // // ("finalItems", finalItems);
//       // // // ("mix", [...items, ...finalItems]);

//       // channelsData[channelName].items = [
//       //   ...channelsData[channelName].items,
//       //   ...finalItems,
//       // ];

//       // ("items after finalItems", items);
//     }

//     return channelsData;
//   }

//   const data = await scrollAndExtract();

//   for (const channel of Object.keys(data)) {
//     const uniqueItems = new Set();
//     const filteredItems = [];

//     data[channel].items.forEach((item) => {
//       const key = item.title; // or another unique property
//       if (!uniqueItems.has(key)) {
//         uniqueItems.add(key);
//         filteredItems.push(item);
//       }
//     });

//     data[channel].items = filteredItems;
//   }

//   ("data", data);

//   const jsonData = JSON.stringify(data, null, 2);
//   const filePath = "channels.json";

//   try {
//     fs.appendFileSync(filePath, jsonData);
//   } catch (err) {
//     (err);
//   }

//   await browser.close();
// })();

// Connection

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  "App running in port: " + PORT;
});
