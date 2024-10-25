const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const {
  registerUserController,
  loginUserController,
  logUserOutController,
  Me,
} = require("../controllers/UserController");
const Authorization = require("../middleware/Authorization");

router
  .post("/register", registerUserController)
  .post("/login", loginUserController)
  .post("/logout", logUserOutController)
  .get("/me", Authorization, async (req, res) => {
    const user = req.user;
    const data = await fetch(`https://www.youtube.com/watch?v=f4k3TzvT10E`);
    const html = data.text();
    console.log("User:", user);
    console.log("HTML:", html);

    return res.status(200).send(user);
  });

module.exports = router;
