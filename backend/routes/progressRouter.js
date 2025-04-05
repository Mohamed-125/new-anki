const express = require("express");
const ProgressModel = require("../models/ProgressModel");
const Authorization = require("../middleware/Authorization");

const router = express.Router();

// Mark a lesson as completed
router.post("/", Authorization, async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseLevelId, lessonId } = req.body;

    let progress = await ProgressModel.findOne({ userId, courseLevelId });

    if (!progress) {
      progress = new ProgressModel({
        userId,
        courseLevelId,
        completedLessons: [],
      });
    }

    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
