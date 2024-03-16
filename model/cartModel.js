const mongoose = require('mongoose');
const {Schema,Types} = mongoose;
const objectId = Types.ObjectId;


const cartSchema = new mongoose.Schema({
  userId : {
    type : String,
  },
  productId :{
    type:objectId,
  },
  productName:{
    type:String,
  },
  category:{
    type:String,
  },
  price:{
    type:Number,
  },
  quantity:{
    type:Number,
  },
  productImage:{
    type: [String],
  },
  
});

// Create the Cart model
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
