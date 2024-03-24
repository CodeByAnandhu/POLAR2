const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
   
    couponCode: {
        type: String,
    },
    discount: {
        type: Number,
    },
    expiryDate: {
        type: Date,
    },
    minimumPurchaseAmount: {
        type: Number,
    },
    purchaseAmount: {
        type: Number,
    }

});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;