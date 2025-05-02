const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: [true, "email is require"],
    index: true,
  },
  password: {
    type: String,
    require: [true, "password is require"],
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  languages: [
    {
      type: String,
    },
  ],
  selectedNativeLanguage: {
    type: String,
  },
  proficiencyLevel: {
    type: String,
    enum: ["a1", "a2", "b1", "b2"],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
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

UserSchema.methods.generateResetPasswordToken = async function () {
  const resetToken = jwt.sign({ id: this._id }, process.env.JWT_KEY, {
    expiresIn: "1h",
  });
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hpour
  await this.save();
  return resetToken;
};

UserSchema.methods.validateResetPasswordToken = function () {
  return (
    this.resetPasswordExpires &&
    this.resetPasswordToken &&
    Date.now() <= this.resetPasswordExpires
  );
};
UserSchema.set("toObject", { virtuals: true });
UserSchema.set("toJSON", { virtuals: true });

UserSchema.virtual("collections", {
  ref: "Collection", // The model to use
  localField: "_id", // The field in the User schema
  foreignField: "user", // The field in the Todo schema that references the User
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
