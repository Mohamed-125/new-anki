const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  name: String,
  lang: {
    type: String,
    index: true,
  },
  flag: String,
});
const CourseModel = mongoose.model("Course", CourseSchema);
module.exports = CourseModel;
