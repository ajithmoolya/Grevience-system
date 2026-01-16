const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientEmail: String,        // Officer's email
  recipientRole: String,         // "Taluk Officer" or "DistrictAdmin"
  type: {
    type: String,
    enum: ["NEW_GRIEVANCE", "REOPEN", "ESCALATION", "FEEDBACK", "STATUS_UPDATE"],
    required: true
  },
  grievanceId: String,
  title: String,
  message: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema, "notifications");
