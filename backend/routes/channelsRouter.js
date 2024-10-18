const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../data/channels.json"); // Correct path to your JSON file

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).send("Error reading file");
    }

    try {
      const jsonData = JSON.parse(data); // Parse JSON data
      "response.data", jsonData;
      res.json(jsonData); // Send data to client
    } catch (parseErr) {
      console.error("Error parsing JSON:", parseErr);
      res.status(500).send("Error parsing JSON");
    }
  });
});
module.exports = router;
