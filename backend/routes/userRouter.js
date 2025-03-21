const express = require("express");
const router = express.Router();
const {
  registerUserController,
  loginUserController,
  logUserOutController,
  checkUsernameController,
  updateProfileController,
  getUsersController,
} = require("../controllers/UserController");
const Authorization = require("../middleware/Authorization");

router
  .post("/register", registerUserController)
  .post("/login", loginUserController)
  .post("/logout", logUserOutController)
  .post("/check-username", checkUsernameController)
  .patch("/update-profile", Authorization, updateProfileController)
  .get("/me", Authorization, async (req, res) => {
    const user = req.user;
    console.log("user", user);
    return res.status(200).send(user);
  })
  .get("/users", Authorization, getUsersController);

module.exports = router;
