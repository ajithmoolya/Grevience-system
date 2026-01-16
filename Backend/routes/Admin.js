const express = require("express");

const Form = require("../models/form");


const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const users = require("../models/users");
const router = express.Router();
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const form = require("../models/form");



router.get("/admin/Allgravinces", async (req, res) => {
  try {
    const { state, district } = req.query;
  

    if (!state || !district) {
      return res.status(400).json({ message: "State & District required" });
    }

    // Filter conditions
    const filter = { state, district };

    // All grievances for this state & district
    const all = await Form.find(filter);

    // Pending includes: Submited, Assigned, In Review, Reopened
    const pending = await Form.find({
      ...filter,
      status: { $in: ["Submited", "Assigned", "In Review", "Reopened"] },
    });

    const assigned = await Form.find({ ...filter, status: "Assigned" });
    const resolved = await Form.find({ ...filter, status: "Resolved" });
    const Submited = await Form.find({ ...filter, status: "Submited" });
    const reopened = await Form.find({ ...filter, status: "Reopened" });

    const total = all.length;
    const total_pending = pending.length;
    const total_resolved = resolved.length;
    const total_assigned = assigned.length;
    const total_reopened = reopened.length;

    return res.json({
      all,
      total,
      total_pending,
      total_resolved,
      total_assigned,
      total_reopened,
      pending,
      assigned,
      resolved,
      reopened,
      Submited,
    });
  } catch (error) {
    console.error("Error fetching filtered grievances:", error);
    return res.status(500).json({ message: "Server error", error });
  }
});










router.put("/admin/update_gravince", async (req, res) => {
  const { grevienceID, status, by, remark,assignedTo } = req.body;

  const grievance = await Form.findOne({ grevienceID });

  grievance.status = status;
  grievance.updatedAt = new Date();

  grievance.history.push({
    status,
    assignedTo,
    date: new Date(),
    by: by || "Admin",
    remark: remark || "",
  });

  await grievance.save();
  return res.json({ message:"Grievance updated successfully",grievance: grievance });
});























//Excel report 
router.get("/admin/report/excel", async (req, res) => {
  const { start, end, status } =req.query;
 
  const data = await Form.find({
    createdAt: { $gte: new Date(start), $lte: new Date(end) },
    status: status,
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  // Add header
  sheet.addRow(["ID", "Title", "Category", "status", "Created At","updatedAt"]);

  // Add data
  data.forEach((g) => {
    sheet.addRow([g.grevienceID, g.title, g.category, g.status, g.createdAt, g.updatedAt]);
  });
  // Export
  const buffer = await workbook.xlsx.writeBuffer();

  res.setHeader("Content-Type", "application/vnd.openxmlformats");
  res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

  res.send(buffer);
});


//get grivance
router.get("/admin/getData",async(req,res)=>{
  const {grevienceID}=req.query
  const data= await form.findOne({grevienceID})
  res.json({data})
})


router.get("/admin/getadmin",async(req,res)=>{
  const {email}=req.query
  const data=await users.findOne({email})
  res.json(data)
})


router.get("/admin/report/pdf",async(req,res)=>{
 const { start, end, status } = req.query;
 
  const data = await Form.find({
    createdAt: { $gte: new Date(start), $lte: new Date(end) },
    status: status,
  });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  const pdf = new PDFDocument();
  pdf.pipe(res);

  pdf.fontSize(20).text("Grievance Report");
  pdf.moveDown();

  data.forEach(g => {
    pdf.fontSize(12).text(`ID: ${g.grevienceID}`);
    pdf.text(`Title: ${g.title}`);
    pdf.text(`Category: ${g.category}`);
    pdf.text(`discription:${g.description}`)
    pdf.text(`Status: ${g.status}`);
    pdf.text(`Created Date: ${g.createdAt}`);
    pdf.text(`Upadted Date:${g.updatedAt}`);
    pdf.moveDown();
  });

  pdf.end();
});



// add admin section

// regitser admin
router.post("/admin/adminregister", async (req, res) => {
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
      category,
      role
    } = req.body;

    // Check if email already exists
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);


    // Create new District Admin
    const newAdmin = new users({
      name,
      email,
      password: hashedPassword,
      mobile,
      role,
      Permissions,
      createdby,
      state,
      district,
      active,
      category,
    });

    await newAdmin.save();

    res.status(201).json({
      message: " Admin registered successfully",
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
    const admin = await users.findById(req.params.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await users.findByIdAndDelete(req.params.id);

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

//get admins
router.get("/admin/subofficer", async (req, res) => {
  role="Taluk Officer"
  const admin= await users.find({
    role: role,
  });
  res.json({ admin });
});


//get admin by id 
router.put("/superadmin/admin/:id", async (req, res) => {
  try {
    const { name, email, Permissions } = req.body;

    const updated = await users.findByIdAndUpdate(
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


router.get("/admin/escalated", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    

    const escalated = await form.find({assignedOfficer:email
    });

    return res.json({ escalated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==================== OFFICER NOTIFICATIONS ====================

const Notification = require("../models/notification");

// Get notifications for an officer
router.get("/admin/notifications", async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const notifications = await Notification.find({ 
      recipientEmail: email 
    }).sort({ createdAt: -1 }).limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientEmail: email,
      isRead: false
    });

    return res.json({ 
      success: true,
      notifications, 
      unreadCount 
    });

  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark notification as read
router.put("/admin/notifications/read", async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }

    await Notification.findByIdAndUpdate(notificationId, { isRead: true });

    return res.json({ success: true, message: "Notification marked as read" });

  } catch (err) {
    console.error("Mark Read Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all notifications as read for an officer
router.put("/admin/notifications/read-all", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await Notification.updateMany(
      { recipientEmail: email, isRead: false },
      { isRead: true }
    );

    return res.json({ success: true, message: "All notifications marked as read" });

  } catch (err) {
    console.error("Mark All Read Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a single notification
router.delete("/admin/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ message: "Notification ID is required" });
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.json({ success: true, message: "Notification deleted" });

  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Clear all notifications for an officer
router.delete("/admin/notifications/clear-all/:email", async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await Notification.deleteMany({ recipientEmail: email });

    return res.json({ 
      success: true, 
      message: `${result.deletedCount} notifications cleared` 
    });

  } catch (err) {
    console.error("Clear All Notifications Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;


