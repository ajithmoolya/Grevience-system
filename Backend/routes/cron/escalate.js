const Form = require("../../models/form");
const User = require("../../models/users");
const Notification = require("../../models/notification");

// Escalation time in milliseconds (default: 48 hours)
const ESCALATION_TIME_MS = 48 * 60 * 60 * 1000;
// For testing: 2 minutes
// const ESCALATION_TIME_MS = 2 * 60 * 1000;

async function escalate() {
  try {
    // Find grievances that are still with Taluk Officer and not yet escalated
    // Include all statuses except completed/resolved that should be escalated
    const pending = await Form.find({
      escalated: false,
      status: { 
        $in: ["Submited", "Assigned", "In progress", "In Progress", "Reopened"] 
      }
    });

    console.log(`Found ${pending.length} grievances to check for escalation`);

    for (const g of pending) {
      const now = new Date();
      
      // Skip if assignedAt is not set
      if (!g.assignedAt) {
        console.log(`Grievance ${g.grevienceID} has no assignedAt date, skipping`);
        continue;
      }
      
      const deadline = new Date(g.assignedAt.getTime() + ESCALATION_TIME_MS);

      if (now > deadline) {
        console.log(`Escalating grievance: ${g.grevienceID}`);

        // Find district admin for this location
        const districtOfficer = await User.findOne({
          role: "DistrictAdmin",
          state: g.state,
          district: g.district
        });

        if (!districtOfficer) {
          console.log(`No District Admin found for ${g.state}, ${g.district}`);
          continue;
        }

        // Store previous officer for history
        const previousOfficer = g.assignedOfficer;

        // Find the Taluk Officer to notify them
        const talukOfficer = await User.findOne({
          email: previousOfficer
        });

        // Update grievance to District Officer
        g.assignedOfficer = districtOfficer.email;
        g.escalated = true;
        g.assignedAt = new Date(); // restart timer for district level
        
        // Add escalation to history
        g.history.push({
          status: "Escalated",
          date: new Date(),
          by: "System",
          remark: `Auto-escalated due to no resolution within time limit. Previous officer: ${previousOfficer}`,
          assignedTo: districtOfficer.email
        });
        
        await g.save();

        // Create notification for Taluk Officer (previous handler)
        if (talukOfficer) {
          try {
            await Notification.create({
              recipientEmail: talukOfficer.email,
              recipientRole: talukOfficer.role || "Taluk Officer",
              type: "ESCALATION",
              grievanceId: g.grevienceID,
              title: "Grievance Escalated",
              message: `Grievance ${g.grevienceID} has been escalated to District Admin due to time limit exceeded. Please ensure timely resolution of assigned grievances.`,
              isRead: false,
              createdAt: new Date()
            });
            console.log(`Notified Taluk Officer: ${talukOfficer.email}`);
          } catch (notifErr) {
            console.log("Could not create Taluk Officer notification:", notifErr.message);
          }
        }

        // Create notification for District Officer (new handler)
        try {
          await Notification.create({
            recipientEmail: districtOfficer.email,
            recipientRole: "DistrictAdmin",
            type: "ESCALATION",
            grievanceId: g.grevienceID,
            title: "Grievance Escalated",
            message: `Grievance ${g.grevienceID} has been escalated to you due to time limit exceeded.`,
            isRead: false,
            createdAt: new Date()
          });
        } catch (notifErr) {
          console.log("Could not create District Admin notification:", notifErr.message);
        }

        console.log(`Escalated ${g.grevienceID} to District Officer: ${districtOfficer.email}`);
      }
    }
  } catch (err) {
    console.error("Escalation Error:", err);
  }
}

module.exports = escalate;
