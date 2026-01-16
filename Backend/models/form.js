const { default: mongoose } = require("mongoose")

const grevienceForm=new mongoose.Schema({
  email:String,
  grevienceID:String,
  title:String,
  category:String,
  description:String,
  state:String,
  district:String,
  location:String,
  evidence: String,
  status: String,

  assignedOfficer: String,                     // taluk or district officer email
  assignedAt: { type: Date, default: Date.now }, 
  escalated: { type: Boolean, default: false }, 
  
  createdAt: Date,         
  updatedAt: Date,
  
  // Feedback System
  citizenRating: { type: Number, min: 1, max: 5 },
  citizenFeedback: String,
  feedbackDate: Date,
  isFeedbackSubmitted: { type: Boolean, default: false },
  
  // Reopen System
  reopenCount: { type: Number, default: 0 },
  reopenReason: String,
  reopenExplanation: String,
  reopenDate: Date,
  isReopened: { type: Boolean, default: false },
  
  history: [
    {
      status: String,      
      date: Date,          
      by: String,          
      remark: String,
      assignedTo: String, 

    }
  ]
})

// Export both models properly
module.exports = mongoose.model("form",grevienceForm, "grevience_details");

