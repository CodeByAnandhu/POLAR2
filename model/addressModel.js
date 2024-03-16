const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    name: {
        type: String,
    },
    address: {
        type: String,
    },
    locality: {
        type: String,
    },
    phone: {
        type: Number,
    },
    pincode: {
        type: Number,
    },
    state: {
        type: String,
    },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;