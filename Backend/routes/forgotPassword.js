const express = require("express");
const router = express.Router();
const User = require("../models/users");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Configure email transporter (update with your email service)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP to email
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || "your-email@gmail.com",
        to: email,
        subject: "Password Reset OTP - Grievance System",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #1976d2, #1565c0); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Grievance System</h1>
            </div>
            <div style="padding: 30px; background: #f5f5f5;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p style="color: #666; font-size: 16px;">
                You have requested to reset your password. Use the OTP below to verify your identity:
              </p>
              <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <p style="font-size: 32px; font-weight: bold; color: #1976d2; letter-spacing: 8px; margin: 0;">
                  ${otp}
                </p>
              </div>
              <p style="color: #666; font-size: 14px;">
                This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                If you did not request this password reset, please ignore this email.
              </p>
            </div>
            <div style="padding: 20px; text-align: center; background: #333;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2026 Grievance System. All rights reserved.
              </p>
            </div>
          </div>
        `,
      });

      res.json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // For development/testing, return OTP in response
      res.json({
        success: true,
        message: "OTP generated (email service not configured)",
        // Remove this in production!
        devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    }
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again.",
    });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found. Please request a new OTP.",
      });
    }

    // Check if OTP expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Verify OTP
    if (storedData.otp !== otp) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`,
      });
    }

    // Mark as verified
    storedData.verified = true;

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP. Please try again.",
    });
  }
});

// Reset Password
router.post("/reset", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const storedData = otpStore.get(email.toLowerCase());

    if (!storedData || !storedData.verified || storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired session. Please start over.",
      });
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Clear OTP
    otpStore.delete(email.toLowerCase());

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again.",
    });
  }
});

module.exports = router;
