const mongoose=require("mongoose")

const stateSchema = new mongoose.Schema({
  "State Code": Number,
  "State Name": String
});

module.exports = mongoose.model("State",stateSchema, "State");