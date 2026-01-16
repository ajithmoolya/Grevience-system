const express=require("express")
const user=require("../models/users")

const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs");
const { route } = require("./staff");
const router=express.Router();


const JWT_SECRET = "MY_SUPER_SECRET_KEY"



const auth_midlleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    // Accept "Bearer token123"
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(400).json({ message: "Invalid token" });
    }
};



//citizen registration
router.post("/register", async(req,res)=>{
    const {name,email,password,mobile,role,state,district}=req.body;
    const active=true
    const existing= await user.findOne({email})
    const hashedPassword = await bcrypt.hash(password, 10);
    if (existing){
        return res.json({message:"Email already registered"})
    }
    const newuser=await user.create({name:name,email:email,password:hashedPassword,mobile:mobile,role:role,state:state,district:district,active:active})
    res.json({message:"user registered",newuser});
})


router.post("/login",async(req,res)=>{
   
    const {email,password}=req.body;

    const existing= await user.findOne({email})
    
    if (!existing){
        return res.json({message:"email not found"})
    }

    const validPassword = bcrypt.compare(password, existing.password);
    if (!validPassword) {
      return res.json({ message: "Incorrect password" });
    }

    if (existing.active==false){
        return res.json({message:"User Blocked"})
    }

    // token creation
    const token = jwt.sign(
      { id: existing._id, email: existing.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const role=existing.role
    const Permissions=existing.Permissions
    const name=existing.name
    return res.json({message:"Log in succussfull",name,email,token,role,Permissions})

})

router.post("/admin_register", async(req,res)=>{
    const {name,email,password,mobile,role,Permissions}=req.body;
    const existing= await user.findOne({email})

    const hashedPassword = await bcrypt.hash(password, 10);
   

    if (existing){
        return res.json({message:"Email already registered"})
    }

    const newuser=await user.create({name:name,email:email,password:hashedPassword,mobile:mobile,role:role,Permissions:Permissions})
    res.json({message:"user registered",newuser});
})


//staff register
router.post("/admin/staff",async(req,res)=>{
  const {name,email,password,mobile,role,state,district,category,staffId}=req.body;
  const active=true
  const existing= await user.findOne({email})
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existing){
        return res.json({message:"Email already registered"})
    }

  const newuser=await user.create({name:name,email:email,password:hashedPassword,mobile:mobile,role:role,staffId:staffId,state:state,district:district,active:active,category:category})
  res.json({message:"staff registered",password});
  }
)

//staff log in 
router.post("/staff/login",async(req,res)=>{

    const {email,password}=req.body;    
    const existing= await user.findOne({email,role:"staff"})
    
    if (!existing){
        return res.json({message:"email not found"})
    }
    const validPassword = bcrypt.compare(password, existing.password);
    if (!validPassword) {
      return res.json({ message: "Incorrect password" });
    }
    // token creation
    const token = jwt.sign(
      { id: existing._id, email: existing.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    const role=existing.role
   
    const name=existing.name
    const staffId=existing.staffId  
    return res.json({message:"Log in succussfull",name,email,token,role,staffId})   
})

router.get("/profile", auth_midlleware, async (req, res) => {
    const email = req.user.email;
    const existing = await user.findOne({ email });

    if (!existing) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ profile: existing });
});


    



module.exports = router; 
