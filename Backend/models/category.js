const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: String,
  items: [String]
});

module.exports = mongoose.model("Category", CategorySchema,"Category");
