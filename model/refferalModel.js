const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const RefferalSchema = new Schema({
    
    percentage: {
        type: Number,
        min: 0,
        max: 100,
    },
    refferalAmound:{
        type: Number,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true
    },
});

const Refferal = mongoose.model('Refferal', RefferalSchema);

module.exports = Refferal;
