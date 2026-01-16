const express = require("express");
const cors = require("cors");
const connectiondb = require("./config/db");
const Authroute = require("./routes/auth");
const user=require("./models/users")
const GravienceForm=require("./routes/gravienceForm")
const admin=require("./routes/Admin")
const locations=require("./routes/locations")
const staff=require("./routes/staff")
const category=require("./routes/categories")
const path = require("path");
const superadmin=require("./routes/superaadmin")
const forgotPassword=require("./routes/forgotPassword")



// ✅ Connect to MongoDB
connectiondb();

const app = express();

app.use(cors());
app.use(express.json());


// Serve Uploaded Files
app.use("/uploads", express.static(path.join(__dirname, "Uploads")));

app.post("/message", (req, res) => res.send("Server is running!"));

// Auth routes
app.use("/", Authroute);

//gravience route
app.use("/",GravienceForm);

//admin page 
app.use("/",admin)

//locations
app.use("/",locations)

//staff
app.use("/",staff)

//category
app.use("/",category)


//superadminroutes
app.use("/",superadmin)

//forgot password
app.use("/forgot-password",forgotPassword)


//escalation
const cron = require("node-cron");
const escalate = require("./routes/cron/escalate");


cron.schedule("*/10 * * * * *", () => {
  console.log("⏳ Checking for escalation...");
  escalate();
});


// cron.schedule("*/10 * * * * *", () => escalate());




// Listen on all interfaces for network access
const PORT = 8000;
const HOST = "0.0.0.0"; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://192.168.29.231:${PORT}`);
});