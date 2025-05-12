const express = require("express");
const router = express.Router();
const ListModel = require("../models/ListModel");
const Authorization = require("../middleware/Authorization");
const VideoModel = require("../models/VideoModel");
const textModel = require("../models/TextModel");
const UserListModel = require("../models/UserListModel");
const UserVideoModel = require("../models/UserVideoModel");
// Get all lists for a topic
router.get("/", Authorization, async (req, res) => {
  const { page = 0, searchQuery, topicId, language } = req.query;
  const limit = 10;
  const query = { topicId, language };

  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: "i" };
  }

  try {
    const listsCount = await ListModel.countDocuments(query);
    const skipNumber = page * limit;
    const remaining = Math.max(0, listsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? Number(page) + 1 : null;

    const lists = await ListModel.find(query).skip(skipNumber).limit(limit);

    res.json({ lists, nextPage, listsCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's lists
router.get("/user", Authorization, async (req, res) => {
  try {
    const { page = 0, language } = req.query;

    const limit = 10;
    const userId = req.user._id;

    const userListsCount = await UserListModel.countDocuments({
      userId,
      language,
    });
    const skipNumber = page * limit;
    const remaining = Math.max(0, userListsCount - limit * (page + 1));
    const nextPage = remaining > 0 ? Number(page) + 1 : null;

    const userLists = await UserListModel.find({ userId })
      .sort({ lastAccessedAt: -1 })
      .skip(skipNumber)
      .limit(limit)
      .populate({
        path: "listId",
        match: {
          language,
        },
      })
      .lean();

    return res.send({ userLists, userListsCount, nextPage });
  } catch (error) {
    return res.status(400).send("error in getting user lists");
  }
});

// get a list
router.get("/user/:id", Authorization, async (req, res) => {
  try {
    const list = await UserListModel.findOne({ listId: req.params.id });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Add list to user's collection
router.post("/user/:id/add", Authorization, async (req, res) => {
  try {
    const userId = req.user._id;
    const listId = req.params.id;

    let userList = await UserListModel.findOne({ userId, listId });

    if (!userList) {
      userList = await UserListModel.create({
        userId,
        listId,
        lastAccessedAt: new Date(),
      });
    } else {
      userList.lastAccessedAt = new Date();
      await userList.save();
    }

    res.status(200).json(userList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove list from user's collection
router.delete("/user/:id/remove", Authorization, async (req, res) => {
  try {
    const userId = req.user._id;
    const listId = req.params.id;

    const result = await UserListModel.findOneAndDelete({ userId, listId });
    if (!result) {
      return res
        .status(404)
        .json({ message: "List not found in user's collection" });
    }

    res.json({ message: "List removed from collection successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark video as completed in user's list
router.post(
  "/user/:listId/complete-video/:videoId",
  Authorization,
  async (req, res) => {
    console.log("list ran");
    try {
      const userId = req.user._id;
      const { listId, videoId } = req.params;

      const userList = await UserListModel.findOne({ userId, listId });
      if (!userList) {
        return res.status(404).json({ message: "User list not found" });
      }

      // Add video to completed videos if not already completed
      if (!userList.completedVideos.includes(videoId)) {
        userList.completedVideos.push(videoId);

        // Calculate progress
        const totalVideos = await VideoModel.countDocuments({ listId });
        userList.progress =
          (userList.completedVideos.length / totalVideos) * 100;

        await userList.save();
      }

      res.status(200).json(userList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Mark text as completed in user's list
router.post(
  "/user/:listId/complete-text/:textId",
  Authorization,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const { listId, textId } = req.params;

      const userList = await UserListModel.findOne({ userId, listId });
      if (!userList) {
        return res.status(404).json({ message: "User list not found" });
      }

      // Add text to completed texts if not already completed
      if (!userList.completedTexts.includes(textId)) {
        userList.completedTexts.push(textId);
        await userList.save();
      }

      res.status(200).json(userList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// get a list
router.get("/:id", Authorization, async (req, res) => {
  try {
    const list = await ListModel.findOne({ _id: req.params.id });
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    res.json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Create a new list
router.post("/", Authorization, async (req, res) => {
  try {
    const list = await ListModel.create(req.body);
    res.status(201).json(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a list
router.put("/:id", Authorization, async (req, res) => {
  console.log(req.body, req.params.id);
  try {
    const list = await ListModel.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    res.send(list);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a list
router.delete("/:id", Authorization, async (req, res) => {
  try {
    const list = await ListModel.findById(req.params.id);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }

    // Delete associated videos and texts
    await VideoModel.deleteMany({ listId: req.params.id });
    await textModel.deleteMany({ listId: req.params.id });

    // Delete the list
    await ListModel.findByIdAndDelete(req.params.id);

    // Delete all user-list associations
    await UserListModel.deleteMany({ listId: req.params.id });

    res.json({ message: "List and its content deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Batch delete lists
router.post("/batch-delete", Authorization, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res
        .status(400)
        .json({ message: "Invalid request: ids array is required" });
    }

    // Delete associated videos and texts for all lists
    const videosToDelete = await VideoModel.find({ listId: { $in: ids } });
    const videoIds = videosToDelete.map((video) => video._id);

    // Delete videos and their associated user-video records
    await VideoModel.deleteMany({ listId: { $in: ids } });
    await UserVideoModel.deleteMany({ videoId: { $in: videoIds } });
    await textModel.deleteMany({ listId: { $in: ids } });

    // Delete the lists
    const result = await ListModel.deleteMany({
      _id: { $in: ids },
    });

    // Delete all user-list associations for the deleted lists
    await UserListModel.deleteMany({ listId: { $in: ids } });

    res.json({
      message: `${result.deletedCount} lists and their content deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get videos from a list
router.get("/videos/:id", Authorization, async (req, res) => {
  const listId = req.params?.id;
  const pageNumber = req.query?.page;
  if (!listId) return res.status(400).send("you have to send the listId");

  const limit = 5;
  let page = +pageNumber || 0;
  const skipNumber = page * limit;
  const videosCount = await VideoModel.countDocuments({ listId });

  const remaining = Math.max(0, videosCount - limit * (page + 1));
  const nextPage = remaining > 0 ? page + 1 : null;

  try {
    const videos = await VideoModel.find({ listId }, { defaultCaptionData: 0 })
      .skip(skipNumber)
      .limit(limit);

    res.send({ videos, videosCount, nextPage });
  } catch (err) {
    console.log("topic controller get videos error", videos);
    res.status(400).send(err);
  }
});

// Get texts from a list
router.get("/texts/:id", Authorization, async (req, res) => {
  const listId = req.params?.id;
  const pageNumber = req.query?.page;

  if (!listId) return res.status(400).send("you have to send the listId");

  const limit = 5;
  let page = +pageNumber || 0;
  const skipNumber = page * limit;
  const textsCount = await textModel.countDocuments({ listId });

  const remaining = Math.max(0, textsCount - limit * (page + 1));
  const nextPage = remaining > 0 ? page + 1 : null;

  try {
    const texts = await textModel
      .find({ listId })
      .skip(skipNumber)
      .limit(limit);

    res.send({ texts, textsCount, nextPage });
  } catch (err) {
    console.log("topic controller get texts error", texts);
    res.status(400).send(err);
  }
});

module.exports = router;
