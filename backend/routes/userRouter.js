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
    // const user = req.user;
    // console.log("User:", user);

    axios
      .get("https://www.youtube.com/watch?v=aX8gZAyo5ss&ab_channel=DavidAndrew")
      .then((res) => {
        return res.status(200).send(res.data);
      });
  });

module.exports = router;
