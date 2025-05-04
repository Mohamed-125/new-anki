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
  // Add streak-related fields
  streak: {
    type: Number,
    default: 0,
  },
  lastLoginDate: {
    type: Date,
    default: null,
  },
  activeDays: {
    type: Number,
    default: 0,
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
  this.resetPasswordExpires = Date.now() + 3600000; // 1
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
UserSchema.methods.updateStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

  if (!this.lastLoginDate) {
    // First login
    this.streak = 1;
    this.activeDays = 1;
    this.lastLoginDate = today;
    return;
  }

  const lastLogin = new Date(this.lastLoginDate);
  lastLogin.setHours(0, 0, 0, 0);

  // Calculate the difference in days
  const diffTime = Math.abs(today - lastLogin);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already logged in today, no streak update needed
    return;
  } else if (diffDays === 1) {
    // Consecutive day login - increase streak
    this.streak += 1;
    this.activeDays += 1;
  } else {
    // Streak broken - reset to 1
    this.streak = 1;
    this.activeDays += 1;
  }

  this.lastLoginDate = today;
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
