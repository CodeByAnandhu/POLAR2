const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    orderNumber: { type: String, required: true },
    userId: { type: String, required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productName: { type: String, required: true },
        productImage: { type: [String], required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        status: { type: String, required: true ,default:"Pending"},
        reason: { type: String, default: "" },
        discountPrice: { type: Number, default: 0 },
        couponCode: { type: String },
        refferalCode: { type: String },
    }],
    totalQuantity: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    address: {
        name: { type: String, required: true },
        address: { type: String, required: true },
        locality: { type: String }, 
        phone: { type: String, required: true },
        pincode: { type: String, required: true },
        state: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    orderDate: { type: Date, default: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),}
});


const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
