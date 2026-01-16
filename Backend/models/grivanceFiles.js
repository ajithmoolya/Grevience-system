const mongoose = require("mongoose");

const GrievanceFileSchema = new mongoose.Schema({
  grievanceID: { type: String, required: true },   // Which grievance this belongs to
  uploadedBy: { type: String, required: true },     // "citizen" or "staff"
  uploaderID: { type: String, required: true },     // citizenID or staffID
  files: [{ fileName: String, fileType: String }],   // <-- ARRAY      // Only file name
  fileType: { type: String, required: true },       // pdf, jpg, png
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("GrievanceFile", GrievanceFileSchema,"grievanceFiles");
