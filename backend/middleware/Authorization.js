const { verify } = require("jsonwebtoken");
const UserModel = require("../models/UserModel");

const setReqUser = async (_id, req) => {
  try {
    const user = await UserModel.findOne({ _id });

    req.user = user;
    return user;
  } catch (err) {}
};

const Authorization = async (req, res, next) => {
  const token = req.cookies?.token;
  const refreshToken = req.cookies?.refreshToken;

  if (!token) {
    if (!refreshToken) {
      return res.status(401).send("unathroized you have to login");
    }

    try {
      try {
        const { id: userId } = verify(refreshToken, process.env.JWT_KEY);
        const user = await setReqUser(userId, req);
        user.generateNewToken(res);
      } catch (err) {
        return res.status(401).send("unathroized you have to login");
      }
    } catch (err) {}

    return next();
  }

  try {
    const { id: userId } = verify(token, process.env.JWT_KEY);
    await setReqUser(userId, req);
  } catch (err) {}

  next();
};

module.exports = Authorization;
