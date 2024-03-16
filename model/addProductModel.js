const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
  },
  price: {
    type: Number,
  },
  description: {
    type: String,
  },
  selectCategory: {
    type: String,
  },
  productImage: {
    type: [String],
  },
  stockCount: {
    type: Number,
  },
  productOffer: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  addingTime: {
    type: Date,
    default: Date.now 
  },
  isFeatured: {
    type: Boolean,
    default: false 
  }
});

const AddProduct = mongoose.model("Product", productSchema);

module.exports = AddProduct;
