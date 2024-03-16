// const mongoose = require("mongoose");
// const { schema } = require("./userModel");
// const Schema = mongoose.Schema;

// const UserOTPVerificationSchema = new Schema({

//     userId : String,
//     otp : String,
//     createdAt : Date,
//     expiresAt : Date,
// });

// const UserOTPVerification = mongoose.model(

//     "UserOTPVerification",
//     UserOTPVerificationSchema
// );

// module.exports = UserOTPVerification;

const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60,
  },
});

module.exports = mongoose.model("OTP", otpSchema);
