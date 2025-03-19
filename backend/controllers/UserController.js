const UserModel = require("../models/UserModel");

module.exports.registerUserController = async (req, res, next) => {
  const { password, email } = req.body;
  if (!password || !email) {
    return res.status(400).send("you have to enter you data");
  }

  try {
    const user = await UserModel.findOne({
      email,
    });

    console.log("user", user);
    if (user)
      return res.status(400).send("User with this email already exsists");

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

module.exports.updateProfileController = async (req, res, next) => {
  const {
    username,
    email,
    languages,
    selectedNativeLanguage,
    proficiencyLevel,
  } = req.body;
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).send("User not found");

    if (username) user.username = username;
    if (email) user.email = email;
    if (languages && Array.isArray(languages)) user.languages = languages;
    if (selectedNativeLanguage)
      user.selectedNativeLanguage = selectedNativeLanguage;
    if (proficiencyLevel) user.proficiencyLevel = proficiencyLevel;

    await user.save();
    res.status(200).send(user);
  } catch (err) {
    console.log("Update profile error:", err);
    res.status(400).send(err.message);
  }
};

module.exports.loginUserController = async (req, res, next) => {
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

module.exports.updateProfileController = async (req, res, next) => {
  const {
    username,
    email,
    languages,
    selectedNativeLanguage,
    proficiencyLevel,
  } = req.body;
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).send("User not found");

    if (username) user.username = username;
    if (email) user.email = email;
    if (languages && Array.isArray(languages)) user.languages = languages;
    if (selectedNativeLanguage)
      user.selectedNativeLanguage = selectedNativeLanguage;
    if (proficiencyLevel) user.proficiencyLevel = proficiencyLevel;

    await user.save();
    res.status(200).send(user);
  } catch (err) {
    console.log("Update profile error:", err);
    res.status(400).send(err.message);
  }
};

module.exports.checkUsernameController = async (req, res, next) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).send("Username is required");
  }
  try {
    const userExists = await UserModel.findOne({ username });

    console.log(userExists, !userExists, !!userExists, Boolean(userExists));
    return res.status(200).json({ isUnique: !userExists });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports.updateProfileController = async (req, res, next) => {
  const {
    username,
    email,
    languages,
    selectedNativeLanguage,
    proficiencyLevel,
  } = req.body;
  try {
    const user = await UserModel.findById(req.user._id);
    if (!user) return res.status(404).send("User not found");

    if (username) user.username = username;
    if (email) user.email = email;
    if (languages && Array.isArray(languages)) user.languages = languages;
    if (selectedNativeLanguage)
      user.selectedNativeLanguage = selectedNativeLanguage;
    if (proficiencyLevel) user.proficiencyLevel = proficiencyLevel;

    await user.save();
    res.status(200).send(user);
  } catch (err) {
    console.log("Update profile error:", err);
    res.status(400).send(err.message);
  }
};

module.exports.logUserOutController = async (req, res, next) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production" ? true : false, // Only over HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    secure: process.env.NODE_ENV === "production" ? true : false, // Only over HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).send("user logged out ");
};
