const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const discountSchema = new Schema({
   
    discount: {
        type: Number,
        min: 0,
        max: 100,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        ref: 'category'
    }
});

const Discount = mongoose.model('Discount', discountSchema);

module.exports = Discount;
