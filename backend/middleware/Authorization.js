const { decode } = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const setReqUser = async (_id, req) => {
  try {
    const user = await UserModel.findOne({ _id });
    req.user = user;
    return user;
  } catch (err) {}
};

const Authorization = async (req, res, next) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  console.log("req.cookies", req.cookies);
  if (!token) {
    if (!refreshToken) {
      return res.status(401).send("unathroized you have to login");
    }

    try {
      const { id: userId } = decode(refreshToken);
      const user = await setReqUser(userId, req);
      user.generateNewToken(res);
    } catch (err) {}

    return next();
  }
  const { id: userId } = decode(token);
  await setReqUser(userId, req);
  next();
};

module.exports = Authorization;
