const UserModel = require("../models/UserModel");

module.exports.registerUserController = async (req, res, next) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return res.status(400).send("you have to enter you data");
  }
  try {
    const createdUser = await UserModel.create({
      password,
      email,
    });

    createdUser.generateNewToken(res);
    createdUser.generateRefreshToken(res);

    res.status(201).send(createdUser);
  } catch (err) {
    err;
    res.status(400).send(err.message);
  }
};

module.exports.loginUserController = async (req, res, next) => {
  console.log(req.body);
  const { password, email } = req.body;
  if (!password || !email) {
    return res.status(400).send("you have to enter email and password");
  }
  try {
    const userFound = await UserModel.findOne({
      email,
    });

    if (!userFound || !userFound.isMatch(password))
      return res
        .status(400)
        .send("please enter the correct email and password");

    userFound.generateNewToken(res);
    userFound.generateRefreshToken(res);

    res.status(201).send(userFound);
  } catch (err) {
    console.log("login error", err.message);
    res.status(400).send(err.message);
  }
};

module.exports.logUserOutController = async (req, res, next) => {
  res.clearCookie("token", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).send("user logged out ");
};
