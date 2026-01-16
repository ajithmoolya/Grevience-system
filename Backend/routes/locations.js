const express=require("express")

const State=require("../models/state")
const District=require("../models/district")


const router=express.Router();


router.get("/state",async(req,res)=>{

 const states = await State.find({});
  res.json(states);
})


// Get districts by stateCode
router.get("/districts/:stateCode", async (req, res) => {
const districts = await District.find({ "State Code": Number(req.params.stateCode) });
  res.json(districts);
});



module.exports = router;