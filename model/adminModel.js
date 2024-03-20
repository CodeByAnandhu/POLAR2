const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: Number,
  },

  confirmPassword: {
    type: Number,
  },
});

// Hash and salt password before saving
// adminSchema.pre('save', async function (next) {
//   try {
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(this.password, salt);
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

//Export the model
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
