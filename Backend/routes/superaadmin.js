const express = require("express");
const Form = require("../models/form");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const JWT_SECRET = "MY_SUPER_SECRET_KEY";
const multer = require("multer");
const files = require("../models/grivanceFiles");


// GET /superadmin/grievances - Get all grievances (with filters)
// GET /superadmin/grievances/:id - Get single grievance with full details
// PUT /superadmin/grievances/:id/status - Override grievance status
// PUT /superadmin/grievances/:id/reassign - Reassign grievance to different staff
// GET /superadmin/grievances/:id/proof - Get proof/attachments for a grievance



router.get("/superadmin/grievances", async (req, res) => {
  const all = await Form.find();

  const pending = await Form.find({
    status: { $in: ["Submited", "Assigned", "In Review"] }, 
  });

  const assigned = await Form.find({ status: "Assigned" });
  const resolved = await Form.find({ status: "Resolved" });
  const Submited = await Form.findOne({ status: "Submited" });
  const escalated = await Form.find({ escalated: true });
  const reopened = await Form.find({ status: "Reopened" });

  const total_assigned = assigned.length;

  // const total_grievance = all.length;
  const total_pending = pending.length;
  const total_resolved = resolved.length;
  const total = all.length;
  const total_escalated = escalated.length;
  const total_reopened = reopened.length;

  data = {
    all,
    total_assigned,
    total,
    total_pending,
    total_resolved,
    total_escalated,
    total_reopened,
    assigned,
    resolved,
    Submited,
  };
  return res.json(data);
});

// GET /superadmin/dashboard/stats - Enhanced dashboard statistics
router.get("/superadmin/dashboard/stats", async (req, res) => {
  try {
    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Monthly trends for last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentYear, now.getMonth() - i, 1);
      const monthEnd = new Date(currentYear, now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthPending = await Form.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: { $in: ["Submited", "Assigned", "In Review", "Reopened", "In Progress"] }
      });
      
      const monthResolved = await Form.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd },
        status: "Resolved"
      });
      
      const monthName = monthStart.toLocaleString('default', { month: 'short' });
      monthlyData.push({
        name: monthName,
        pending: monthPending,
        resolved: monthResolved
      });
    }
    
    // Category distribution
    const categoryAggregation = await Form.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    
    const categoryData = categoryAggregation.map(cat => ({
      name: cat._id || "Uncategorized",
      value: cat.count
    }));
    
    // District-wise distribution
    const districtAggregation = await Form.aggregate([
      {
        $group: {
          _id: "$district",
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] }
          }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);
    
    const districtData = districtAggregation.map(dist => ({
      name: dist._id || "Unknown",
      total: dist.total,
      resolved: dist.resolved
    }));
    
    // Calculate average resolution time (for resolved grievances)
    const resolvedGrievances = await Form.find({
      status: "Resolved",
      createdAt: { $exists: true },
      updatedAt: { $exists: true }
    }).select('createdAt updatedAt');
    
    let avgResolutionTime = 0;
    if (resolvedGrievances.length > 0) {
      const totalTime = resolvedGrievances.reduce((acc, g) => {
        const created = new Date(g.createdAt);
        const updated = new Date(g.updatedAt);
        return acc + (updated - created);
      }, 0);
      avgResolutionTime = Math.round((totalTime / resolvedGrievances.length) / (1000 * 60 * 60 * 24) * 10) / 10; // days
    }
    
    res.json({
      success: true,
      monthlyData,
      categoryData,
      districtData,
      avgResolutionTime
    });
    
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats", error });
  }
});

// GET /superadmin/logs - Get activity logs from grievance history
router.get("/superadmin/logs", async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    
    // Get recent grievances with history
    const grievances = await Form.find({})
      .select('grevienceID title category history status assignedOfficer')
      .sort({ updatedAt: -1 })
      .limit(100);
    
    // Flatten all history entries into logs
    let logs = [];
    
    grievances.forEach(g => {
      if (g.history && Array.isArray(g.history)) {
        g.history.forEach((h, index) => {
          let logType = 'info';
          let action = h.status || 'Status Update';
          
          // Determine log type based on status/action
          if (h.status === 'Resolved' || h.status === 'Closed') {
            logType = 'success';
          } else if (h.status === 'Reopened' || h.status === 'Escalated') {
            logType = 'warning';
          } else if (h.status === 'Rejected') {
            logType = 'error';
          } else if (h.status === 'Submited') {
            logType = 'info';
            action = 'New Grievance';
          } else if (h.status === 'Assigned') {
            logType = 'success';
            action = 'Grievance Assigned';
          } else if (h.status === 'Feedback Submitted') {
            logType = 'success';
            action = 'Feedback Received';
          }
          
          logs.push({
            id: `${g._id}-${index}`,
            action: action,
            user: h.by || 'System',
            timestamp: h.date,
            details: `${g.grevienceID} - ${h.remark || g.title || 'No details'}`,
            type: logType,
            grievanceId: g.grevienceID,
            status: h.status
          });
        });
      }
    });
    
    // Sort by timestamp descending
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Filter by type if specified
    if (type && type !== 'all') {
      logs = logs.filter(l => l.type === type);
    }
    
    // Limit results
    logs = logs.slice(0, parseInt(limit));
    
    // Get stats
    const stats = {
      total: logs.length,
      success: logs.filter(l => l.type === 'success').length,
      warning: logs.filter(l => l.type === 'warning').length,
      error: logs.filter(l => l.type === 'error').length,
      info: logs.filter(l => l.type === 'info').length
    };
    
    res.json({
      success: true,
      logs,
      stats
    });
    
  } catch (error) {
    console.error("Logs error:", error);
    res.status(500).json({ message: "Error fetching logs", error });
  }
});



// regitser admin
router.post("/superadmin/adminregister", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      Permissions,
      createdby,
      state,
      district,
      active,
      category
    } = req.body;
    
    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create new District Admin
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
      role: "DistrictAdmin",
      Permissions,
      createdby,
      state,
      district,
      active,
      category,
    });

    await newAdmin.save();

    res.status(201).json({
      message: "District Admin registered successfully",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Error creating District Admin:", error);
    res.status(500).json({
      message: "Server error while creating District Admin",
      error,
    });
  }
});


// DELETE /superadmin/admin/:id - Delete an admin
router.delete("/superadmin/admin/:id", async (req, res) => {
  try {
    const admin = await User.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "Admin deleted successfully",
      deletedAdmin: admin
    });

  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({
      message: "Server error while deleting admin",
      error,
    });
  }
});


router.get("/superadmin/adminlst", async (req, res) => {

  try {
    const role = "DistrictAdmin";

    const admin = await User.find({role});

    return res.json({ admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching admins" });
  }
});


router.get("/superadmin/alladminlst", async (req, res) => {
  try {
    const admin = await User.find({
      role: { $in: ["DistrictAdmin", "Taluk Officer"] }
    });

    return res.json({ admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching admins" });
  }
});







//get admin by id 
router.put("/superadmin/admin/:id", async (req, res) => {
  try {
    const { name, email, Permissions } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        Permissions
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({ message: "Admin updated successfully", admin: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating admin", error });
  }
});



// register staff

router.post("/superadmin/addstaff",async(req,res)=>{
  const {name,email,mobile,state,district,category}=req.body;
  const active=true

  const password = name + "@staff" + Math.floor(100 + Math.random() * 900); 
  const role="staff"
  const staffId = "STF" + Math.floor(10000 + Math.random() * 90000);

  const existing= await User.findOne({email})
  const hashedPassword = await bcrypt.hash(password, 10);
  
  if (existing){
        return res.json({message:"Email already registered"})
    }

  const newuser=await User.create({name:name,email:email,password:hashedPassword,mobile:mobile,role:role,staffId:staffId,state:state,district:district,active:active,category:category})
  res.json({message:"staff registered",password});
  }
)

//update staff
// UPDATE STAFF
router.patch("/superadmin/updatestaff/:id", async (req, res) => {
  try {
    const staffId = req.params.id;
    const updates = req.body;

    // If updating email, ensure email is not already taken
    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: staffId } });
      if (existing) {
        return res.json({ message: "Email already registered by another user" });
      }
    }

    // Update staff details
    const updatedStaff = await User.findByIdAndUpdate(
      staffId,
      updates,
      { new: true }
    );

    if (!updatedStaff) {
      return res.json({ message: "Staff not found" });
    }

    res.json({
      message: "Staff updated successfully",
      updatedStaff,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating staff" });
  }
});














//get all the staff 
router.get("/superadmin/staff", async (req, res) => {
  try {
    let { state, district } = req.query;
    let query = { role: "staff" };

    if (state && state !== "") query.state = state;
    if (district && district !== "") query.district = district;

    const staff = await User.find(query);

    res.json({ staff });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Server error while fetching staff" });
  }
});



//user management 
router.get("/superadmin/citizens", async (req, res) => {
  try {
    let { state, district } = req.query;

    let query = { role: "Citizen" };

    if (state && state !== "") query.state = state;
    if (district && district !== "") query.district = district;

    const citizens = await User.find(query);

    res.json({ citizens });
  } catch (error) {
    console.error("Error fetching citizens:", error);
    res.status(500).json({ message: "Server error while fetching citizens" });
  }
});






module.exports = router;