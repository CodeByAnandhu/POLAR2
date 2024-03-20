
const mongoose = require("mongoose");
require('dotenv').config(); 

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = mongoose;
