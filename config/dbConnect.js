// dbConnect.js

// const mongoose = require('mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/Polar", { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log("Mongodb is connected");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

// module.exports = mongoose;

const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/Polar")
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = mongoose;
