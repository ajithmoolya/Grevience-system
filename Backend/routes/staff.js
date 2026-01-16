const express = require("express");
const Form = require("../models/form");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const JWT_SECRET = "MY_SUPER_SECRET_KEY";
const multer = require("multer");
const files = require("../models/grivanceFiles");

const path = require("path");
const fs = require("fs");

router.get("/staff", async (req, res) => {
  const { role, state, district, active, category } = req.query;

  const staff = await User.find({
    role: role,
    state: state,
    district: district,
    active: active,
    category: category,
  });

  res.json({ staff });
});


router.get("/staff/details", async (req, res) => {
  const role = "staff";
  const active = true;
  const inactive = false;
  const total = await User.find({ role: role });
  const total_staff = total.length;
  const actives = await User.find({ active: active });
  const inactives = await User.find({ active: inactive });
  const active_staff = actives.length;
  const inactive_staff = inactives.length;
  res.json({ total, total_staff, active_staff, inactive_staff });
});


router.get("/staff/assignment", async (req, res) => {
  const { staff_id } = req.query;
  const assignement = await Form.find({ "history.assignedTo": staff_id });
  res.json({ assignement });
});


const storage = multer.diskStorage({
  destination: "Uploads/Staff",

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "." + file.mimetype.split("/")[1];
    cb(null, Date.now() + ext);
  },
});


const upload = multer({ storage });

router.post("/staff/uploadproof", upload.array("files", 10), async (req, res) => {
  try {
    const { grievanceID } = req.body;
    const uploadedBy = "staff";

    if (!grievanceID) {
      return res.status(400).json({ error: "grievanceID is required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Prepare file array
    const fileArray = req.files.map(file => ({
      fileName: file.filename,
      fileType: file.mimetype
    }));

    // Update the grievance file entry (or create if not exists)
    const updatedEntry = await files.findOneAndUpdate(
      { grievanceID },                    // find same grievance
      {
        $set: { uploadedBy },
        $push: { files: { $each: fileArray } }
      },
      { new: true, upsert: true }        // create if not exists
    );

    return res.status(200).json({
      message: "Files uploaded successfully",
      data: updatedEntry
    });

  } catch (err) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/staff/getproof", async (req, res) => {
  try {
    const { grievanceID, uploadedBy } = req.query;

    if (!grievanceID || !uploadedBy) {
      return res.status(400).json({
        error: "grievanceID and uploadedBy are required"
      });
    }

    const fileData = await files.findOne({ grievanceID, uploadedBy });

    if (!fileData) {
      return res.status(404).json({ message: "No files found" });
    }

    // Add file URL for each file
    const modifiedFiles = fileData.files.map((file) => ({
      ...file._doc,  // to flatten mongoose object
      fileURL: `${req.protocol}://${req.get("host")}/uploads/Staff/${file.fileName}`

    }));

    return res.status(200).json({
      message: "Files fetched successfully",
      count: modifiedFiles.length,
      files: modifiedFiles
    });

  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});





module.exports = router;
