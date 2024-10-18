const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const {
  registerUserController,
  loginUserController,
  logUserOutController,
} = require("../controllers/UserController");
const Authorization = require("../middleware/Authorization");

router
  .post("/register", registerUserController)
  .post("/login", loginUserController)
  .post("/logout", logUserOutController)
  .get("/me", Authorization, async (req, res) => {
    const user = req.user;
    "user", user;
    res.send(user);
  });

module.exports = router;
