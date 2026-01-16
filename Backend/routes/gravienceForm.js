const express = require("express");

const Form = require("../models/form");
const user=require("../models/users")
const Notification = require("../models/notification");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const files = require("../models/grivanceFiles");


router.post("/gravienceForm", async (req, res) => {
  const {
    email,
    grevienceID,
    title,
    category,
    description,
    location,
    status,
    createdAt,
  } = req.body;
  const existing= await user.findOne({email})

  state=existing.state
  district=existing.district


      // ⭐ Find the Taluk Officer for this district
    const talukOfficer = await user.findOne({
      role: "Taluk Officer",
      state: state,
      district: district,
    });

    if (!talukOfficer) {
      console.log("taluk officer not found ")
      return res.status(400).json({ message: "Taluk officer not found" });
    }


  const newdata = await Form.create({
    email: email,
    grevienceID: grevienceID,
    title: title,
    category: category,
    description: description,
    location: location,
    status: status,
    state:state,
    district:district,

    // ⭐ NEW FIELDS FOR ESCALATION
    assignedOfficer: talukOfficer.email,
    assignedAt: new Date(),
    escalated: false,




    createdAt: createdAt,
    history: [
      {
        status: "Submited",
        date: createdAt || new Date(),
        remark: "Grievance submitted",
        by: email, // or "user"
      },
    ],
  });

  // Create notification for Taluk Officer about new grievance
  try {
    await Notification.create({
      recipientEmail: talukOfficer.email,
      recipientRole: "Taluk Officer",
      type: "NEW_GRIEVANCE",
      grievanceId: grevienceID,
      title: "New Grievance Received",
      message: `New grievance "${title}" (${grevienceID}) has been submitted in ${district} district.`,
      isRead: false,
      createdAt: new Date()
    });
  } catch (notifErr) {
    console.error("Notification creation failed:", notifErr);
    // Don't fail the request if notification fails
  }

  return res.json({ message: "Submited", newdata });
});





router.post("/Citizen_gravince", async (req, res) => {
  try {
    const { email } = req.body;

    const all = await Form.find({ email });

    const pending = await Form.find({
      email,
      status: { $in: ["Submited", "Assigned","In progress"] }, // ✅ correct usage
    });

    const assigned = await Form.find({ status: "Assigned" });

    const total_assigned = assigned.length;

    const total_grievance = all.length;
    const total_pending = pending.length;

    return res.json({
      message: "Fetched successfully",
      total_pending,
      total_grievance,
      all,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});


router.post("/gravienceForm/Track", async (req, res) => {
  const { grevienceID } = req.body;

  const GrevienceID = grevienceID.toUpperCase();
  const data = await Form.findOne({ grevienceID:GrevienceID });
  if (!data) {
    return res.json({ message: "Invalid GrevienceID" });
  }
  return res.json({ message: "tracked", data });
});


router.post("/Status", async (req, res) => {
  const { grevienceID } = req.body;
  const data = await Form.findOne({ grevienceID });

  return res.json({ data });
});



const storage = multer.diskStorage({
  destination: "Uploads/Citizen",

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "." + file.mimetype.split("/")[1];
    cb(null, Date.now() + ext);
  },
});



const upload = multer({ storage });

router.post("/citizen/uploadproof", upload.array("files", 10), async (req, res) => {
  try {
    const { grievanceID } = req.body;
    const uploadedBy = "Citizen";

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


router.get("/citizen/getproof", async (req, res) => {
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
      fileURL: `${req.protocol}://${req.get("host")}/uploads/Citizen/${file.fileName}`

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


// ==================== FEEDBACK SYSTEM ====================

// Submit feedback for a resolved grievance
router.post("/grievance/feedback", async (req, res) => {
  try {
    const { grievanceId, rating, feedback, email } = req.body;

    if (!grievanceId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Grievance ID and rating are required"
      });
    }

    // Find the grievance
    const grievance = await Form.findOne({ grevienceID: grievanceId });

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      });
    }

    // Check if grievance is resolved
    if (grievance.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Feedback can only be submitted for resolved grievances"
      });
    }

    // Check if feedback already submitted
    if (grievance.isFeedbackSubmitted) {
      return res.status(400).json({
        success: false,
        message: "Feedback has already been submitted for this grievance"
      });
    }

    // Update grievance with feedback
    grievance.citizenRating = rating;
    grievance.citizenFeedback = feedback || "";
    grievance.feedbackDate = new Date();
    grievance.isFeedbackSubmitted = true;

    // Add to history
    grievance.history.push({
      status: "Feedback Submitted",
      date: new Date(),
      by: email || "Citizen",
      remark: `Rating: ${rating}/5 stars. ${feedback || ""}`
    });

    await grievance.save();

    // Create notification for assigned officer about feedback
    try {
      await Notification.create({
        recipientEmail: grievance.assignedOfficer,
        recipientRole: grievance.escalated ? "DistrictAdmin" : "Taluk Officer",
        type: "FEEDBACK",
        grievanceId: grievanceId,
        title: "Feedback Received",
        message: `Citizen rated grievance ${grievanceId} with ${rating}/5 stars. ${feedback ? `Comment: "${feedback}"` : ""}`,
        isRead: false,
        createdAt: new Date()
      });
    } catch (notifErr) {
      console.error("Feedback notification creation failed:", notifErr);
    }

    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      data: {
        rating: grievance.citizenRating,
        feedback: grievance.citizenFeedback
      }
    });

  } catch (err) {
    console.error("Feedback Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get feedback for a grievance
router.get("/grievance/feedback/:grievanceId", async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const grievance = await Form.findOne({ grevienceID: grievanceId });

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      });
    }

    if (!grievance.isFeedbackSubmitted) {
      return res.status(404).json({
        success: false,
        message: "No feedback submitted for this grievance"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        rating: grievance.citizenRating,
        feedback: grievance.citizenFeedback,
        feedbackDate: grievance.feedbackDate
      }
    });

  } catch (err) {
    console.error("Get Feedback Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ==================== REOPEN SYSTEM ====================

// Reopen a resolved grievance
router.post("/grievance/reopen", async (req, res) => {
  try {
    const { grievanceId, reason, explanation, email } = req.body;

    if (!grievanceId || !reason || !explanation) {
      return res.status(400).json({
        success: false,
        message: "Grievance ID, reason, and explanation are required"
      });
    }

    // Find the grievance
    const grievance = await Form.findOne({ grevienceID: grievanceId });

    if (!grievance) {
      return res.status(404).json({
        success: false,
        message: "Grievance not found"
      });
    }

    // Check if grievance is resolved
    if (grievance.status !== "Resolved") {
      return res.status(400).json({
        success: false,
        message: "Only resolved grievances can be reopened"
      });
    }

    // Check reopen limit (max 2 times)
    const maxReopens = 2;
    if (grievance.reopenCount >= maxReopens) {
      return res.status(400).json({
        success: false,
        message: `Grievance can only be reopened ${maxReopens} times. Please submit a new grievance.`
      });
    }

    // Update grievance for reopen
    grievance.status = "Reopened";
    grievance.isReopened = true;
    grievance.reopenCount = (grievance.reopenCount || 0) + 1;
    grievance.reopenReason = reason;
    grievance.reopenExplanation = explanation;
    grievance.reopenDate = new Date();
    grievance.updatedAt = new Date();
    
    // Reset escalation to give Taluk Officer another chance
    grievance.escalated = false;
    grievance.assignedAt = new Date();

    // Add to history
    grievance.history.push({
      status: "Reopened",
      date: new Date(),
      by: email || "Citizen",
      remark: `Reason: ${reason}. ${explanation}`
    });

    await grievance.save();

    // Create notification for assigned officer
    try {
      await Notification.create({
        recipientEmail: grievance.assignedOfficer,
        recipientRole: grievance.escalated ? "DistrictAdmin" : "Taluk Officer",
        type: "REOPEN",
        grievanceId: grievance.grevienceID,
        title: "Grievance Reopened",
        message: `Grievance ${grievanceId} has been reopened by citizen. Reason: ${reason}`,
        isRead: false,
        createdAt: new Date()
      });
    } catch (notifErr) {
      console.error("Notification creation failed:", notifErr);
      // Don't fail the request if notification fails
    }

    return res.status(200).json({
      success: true,
      message: "Grievance reopened successfully",
      data: {
        grievanceId: grievance.grevienceID,
        status: grievance.status,
        reopenCount: grievance.reopenCount
      }
    });

  } catch (err) {
    console.error("Reopen Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

// Get reopened grievances count for officer
router.get("/grievance/reopened", async (req, res) => {
  try {
    const { state, district } = req.query;

    const filter = { 
      status: "Reopened",
      state,
      district
    };

    const reopenedGrievances = await Form.find(filter);

    return res.status(200).json({
      success: true,
      count: reopenedGrievances.length,
      data: reopenedGrievances
    });

  } catch (err) {
    console.error("Get Reopened Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


module.exports = router;
