const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  confirmPassword: {
    type: String,
  },
  phone: {
    type:String,
  },
  profileImage: {
    type:[String],
  },
  walletAmount: {
    type: Number,
    default: 0,
  },
  nightMode: {
    type:Boolean,
    default:false,
  },
  refferalCode: {
    type: String,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
