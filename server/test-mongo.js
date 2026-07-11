const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO MONGODB!");
    process.exit(0);
  })
  .catch((err) => {
    console.log("CONNECTION ERROR DETAILS:");
    console.log(err.name);
    console.log(err.message);
    process.exit(1);
  });
