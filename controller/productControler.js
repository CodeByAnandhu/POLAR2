const express = require("express");
const router = express();
const bcrypt = require("bcrypt");
const mongoose = require("../config/dbConnect");
const AddProduct = require("../model/addProductModel");
const multer = require("../middleware/multer");
const categoryCollection = require("../model/categoryModel")
const flash =  require("connect-flash");

//Get Controll
/////////////////////////////////////////////////////////////////////////////
exports.getEditProduct = async (req, res) => {
    const id = req.params.id;
    try {
      // let productId = req.params.id
      var errorMessage = req.flash("errorMessage");
      const category = await categoryCollection.find();
      const items = await AddProduct.findById(id);
      res.render("editProducts", { items, category ,errorMessage:errorMessage});
    } catch (error) {
      console.log("Error occure in getEditProduct", error);
    }
  };



  exports.addProducts = async (req, res) => {
    try {
      var errorMessage = req.flash("errorMessage");
      const product = await AddProduct.find();
      const categories = await categoryCollection.find();
      res.render("addProduct", { categories, product ,errorMessage:errorMessage });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };


  

exports.getProducts = async (req, res) => {
    try {
      const categories = await AddProduct.find();
      const product = await AddProduct.find();
      const productId = await AddProduct.findById();
      res.render("products", { categories, product, productId });

    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };





  //add categary list to Add Product section to category selection option box
exports.addProduct = async (req, res) => {
    try {
      const categories = await categoryCollection.find();
      res.render("addProduct", { categories });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };
  

  /////////////////////////////////////////////////////////////////////////////









//Post Controll
/////////////////////////////////////////////////////////////////////////////
//Add products
exports.AddProductPost = async (req, res) => {
  try {
    const {
        productName,
        price,
        description,
        selectCategory,
        stockCount,
        isVisible,
    } = req.body;


    // const hasWhiteSpace = (str) => {
    //   return /\s/g.test(str);
    // };

    // const fieldsWithWhiteSpace = {};

    // if (hasWhiteSpace(productName)) {
    //   fieldsWithWhiteSpace.productName = productName.trim();
    // }

    // // if (hasWhiteSpace(description)) {
    // //   fieldsWithWhiteSpace.description = description;
    // // }

    // if (Object.keys(fieldsWithWhiteSpace).length > 0) {
    //   req.flash("errorMessage", 'Please fill all the fields');
    //   return res.redirect("/AddProduct");

    // } 
   

    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    
    if (price < 0) {
        req.flash("errorMessage", 'Negative price not allowed');
        return res.redirect("/AddProduct");
    }

    if (specialChars.test(productName) || specialChars.test(price.toString())) {
        req.flash("errorMessage", 'Special characters not allowed');
        return res.redirect("/AddProduct");
    }

      let productImage = [];

      if (req.files && req.files.length > 0) {
          const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
          productImage = fileUrls;
      }
     
      const addingTime = new Date(); 

      const data = {
          productName: productName,
          price: price,
          description: description,
          selectCategory: selectCategory,
          productImage: productImage,
          stockCount: stockCount,
          isVisible: isVisible,
          addingTime: addingTime, 
      };

      const newProduct = await AddProduct.create(data);

      
      const featuredThreshold = new Date();
      featuredThreshold.setDate(featuredThreshold.getDate() - 7); // Featured threshold - last week

      if (addingTime > featuredThreshold) {
          newProduct.isFeatured = true; // Set isFeatured to true if the product was added within the last week
      }

      await newProduct.save(); 

      res.redirect("/Products");
  } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

  
  

  //Edit Product
  exports.editProduct = async (req, res) => {
    
    try {
        const productId = req.params.id;
        
        let productImage = [];

        if (req.files && req.files.length > 0) {
            const fileUrls = req.files.map((file) => ` /uploads/${file.filename}`);
            productImage = fileUrls;
        }

        
  
        if (!productImage || productImage.length === 0) {
          const product = await AddProduct.findById(productId);
          productImage = product.productImage;
       }



        await AddProduct.findByIdAndUpdate(productId, {
            productName: req.body.productName,
            price: req.body.price,
            productOffer: req.body.productOffer,
            description: req.body.description,
            selectCategory: req.body.selectCategory,
            productImage: productImage,
            stockCount: req.body.stockCount,
        }).then((pass) => {
            res.redirect("/Products");
        });
    } catch (error) {
        console.log("Error occurred in editProduct", error);
        req.flash("errorMessage", 'Internal Server Error');
        res.redirect(`/editProduct/${req.params.id}`);
    }
};


  

// Product Visibility
exports.productVisibility = async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await AddProduct.findById(productId);
  
      if (!product) {
        return res.status(404).send("Product not found");
      }
  
      product.isVisible = !product.isVisible;
  
      await product.save();
  
      res.redirect("/Products");
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    }
  };
  
  
exports.deleteProduct = async (req, res) => {
    const productId = req.params.productId;
    try {
      const result = await AddProduct.findByIdAndDelete(productId);
  
      if (!result) {
        return res.status(404).send("Product not found");
      }
  
      res.redirect("/products");
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).send("Internal Server Error");
    }
  };


  /////////////////////////////////////////////////////////////////////////////

