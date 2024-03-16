const mongoose = require('mongoose');
const { category } = require('../controller/adminCtrl');

const categorySchema = new mongoose.Schema({

    categoryName:{
            type : String, 
        },
    categoryOffer:{
            type : Number,
            default : 0
        },
    isVisible : {
            type : Boolean,
            default : true
       },     
});

const categoryCollection =  mongoose.model("category",categorySchema);
module.exports = categoryCollection