const { default: mongoose } = require("mongoose")


const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    mobile:String,
    role:String,
    Permissions: [String],
    adress:String,
    createdby:String,
    state:String,
    district:String,
    active:Boolean,
    category:String,
    staffId:String
})


module.exports = mongoose.model("User", userSchema, "user_info");

