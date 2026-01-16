const mongose=require("mongoose")
require("dotenv").config()

const connectionDb=async()=>
{
    try{
        await mongose.connect(process.env.MONGODB_URI)
        console.log("mongodb connected ");
    }
    catch(error)
    {
        console.error("database connection error",error)
    }
}

module.exports=connectionDb