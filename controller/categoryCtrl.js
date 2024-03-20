const express = require("express");
const router = express();
// const bcrypt = require("bcrypt");
const mongoose = require("../config/dbConnect");
const Admin = require("../model/adminModel");
const categoryCollection = require("../model/categoryModel");
const AddProduct = require("../model/addProductModel");
const flash = require("connect-flash");




//Get Controll
/////////////////////////////////////////////////////////////////////////////////////////
exports.categorys = async (req, res) => {
    try {
      const categories = await categoryCollection.find();
      res.render("category", { categories });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  };


  
  exports.getEditCategory = async (req, res) => {
    try {
      let id = req.params.categoryId;
      var errorMessage = req.flash("errorMessage");
     
      const category = await categoryCollection.findById(id);
     
      
      res.render("editCategory", { category ,errorMessage:errorMessage});


    } catch (error) {
      console.log("Error while getting edit category:", error);
      res.status(500).send("Error while fetching category data");
    }
  };
  
  


exports.getaddCategory = (req, res) => {
    res.render("addCategory");
  };



/////////////////////////////////////////////////////////////////////////////////////////////////////







  //Post Controll
//////////////////////////////////////////////////////////////////////////////////////////////////////  
// Add category section
exports.postAddCategory = async (req, res) => {
    const data = req.body.categoryName;
  
  
    if (data.charAt(0) !== data.charAt(0).toUpperCase()) {
      return res.render("addCategory", {
        message: "First letter of the category must be uppercase.",
      });
    }
  
   
    if (data.trim() === "") {
      return res.render("addCategory", {
        message: "Type any input",
      });
    }
  
    
    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharsRegex.test(data)) {
      return res.render("addCategory", {
        message: "Category name cannot contain special characters.",
      });
    }
  

    const existingCategory = await categoryCollection.findOne({
      categoryName: data,
    });
    if (existingCategory) {
      return res.render("addCategory", { message: "Category already exists." });
    }
  
    const categoryName = await categoryCollection.create({ categoryName: data });
  
    res.redirect("category");
  };
  

  

//Edit Category
exports.postEditCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const newCategoryName = req.body.categoryName


    if (newCategoryName.trim() === "") {
      req.flash("errorMessage", "Type any input");
      return res.redirect(`/editCategory/${categoryId}`);
    }
    


    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (specialCharsRegex.test(newCategoryName)) {
         req.flash("errorMessage", "Category name cannot contain special characters.");
         return res.redirect(`/editCategory/${categoryId}`);
    }



    if (newCategoryName.charAt(0) !== newCategoryName.charAt(0).toUpperCase()) {
      req.flash("errorMessage","First letter of the category must be uppercase.");
      return res.redirect(`/editCategory/${categoryId}`);
    }
     

     
   
    const existingCategory = await categoryCollection.findOne({
      categoryName: { $regex: new RegExp('^' + newCategoryName + '$', 'i') }
    });
   


      if(existingCategory) {
        req.flash("errorMessage", "Category already exists.");
        return res.redirect(`/editCategory/${categoryId}`);
      }
     
    

    // Update the category
    const updatedCategory = await categoryCollection.findByIdAndUpdate(
      categoryId,
      { categoryName: newCategoryName },
      { new: true } 
    );

    if (!updatedCategory) {
      return res.status(404).send("Category not found");
    }
    

    res.redirect("/Category");
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send("Internal Server Error");
  }
};




  
  //Delete category
exports.deleteCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
  
    try {
      const result = await categoryCollection.findById(categoryId);
      result.isVisible = !result.isVisible;
      await result.save();
      if (!result) {
        return res.status(404).send("Category not found");
        
      }
  
      res.redirect("/category");
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  