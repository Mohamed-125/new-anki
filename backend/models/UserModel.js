const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: [true, "email is require"],
  },
  password: {
    type: String,
    require: [true, "password is require"],
  },
});

UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(this.password, salt);
  this.password = hashed;
  next();
});

UserSchema.methods.generateNewToken = async function (res) {
  const token = jwt.sign({ id: this._id }, process.env.JWT_KEY, {
    expiresIn: process.env.TOKEN_EXPIRESIN,
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false, // Only over HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: process.env.TOKEN_EXPIRESIN,
  });
};

UserSchema.methods.generateRefreshToken = async function (res) {
  const refreshToken = jwt.sign({ id: this._id }, process.env.JWT_KEY, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRESIN,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false, // Only over HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: process.env.REFRESH_TOKEN_EXPIRESIN,
  });
};

UserSchema.methods.isMatch = async function (password) {
  const isVaild = await bcrypt.compare(password, this.password);
  return isVaild;
};
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("collections", {
  ref: "Collection", // The model to use
  localField: "_id", // The field in the User schema
  foreignField: "user", // The field in the Todo schema that references the User
});

UserSchema.index({ email: 1 });

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
