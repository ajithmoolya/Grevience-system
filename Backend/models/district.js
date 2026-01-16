const mongoose=require("mongoose")

const stateSchema = new mongoose.Schema({
  "State Code": Number,
  "District Code": String,
  "District Name":String
});

module.exports = mongoose.model("District",stateSchema, "District");