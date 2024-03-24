const express = require("express");
const router  = express();
const coupon = require("../model/couponModel");
const flash =  require("connect-flash");
const offer = require("../model/offerModel");
const category = require("../model/categoryModel");
const product = require("../model/addProductModel");
const reffreal = require("../model/refferalModel");
//////////////////////////////////////////////////////
exports.getCoupon = async (req, res) => {

    try {
        var errorMessage = req.flash("errorMessage");
        var successMessage = req.flash("successMessage"); 
        const couponData = await coupon.find();
        res.render("coupons",{couponData,errorMessage:errorMessage ,successMessage:successMessage});

    } catch (err) {
        res.status(500).json(err);
        console.log(err);
    }

};


exports.getOffer = async (req, res) => {
    try{
       var errorMessage = req.flash("errorMessage");
       const successMessage = req.flash("successMessage");
       const productData = await product.find();
       const categoryData = await category.find();
       const SportCategory = await product.find({selectCategory:"Sport"},{productName : 1 ,_id:0});
       const ClassicCategory = await product.find({selectCategory:"Classic"},{productName : 1 ,_id:0});
       const offerData = await offer.find();

        res.render("offers",{offerData,
          errorMessage:errorMessage ,
          categoryData ,
          successMessage:successMessage ,
          productData,
          SportCategory,
          ClassicCategory
        
        });
    }catch(err){
        console.log(err);
    }
}


exports.addOffer = async (req, res) => {
    
    try {

        const categoryData = await category.find();
        const productData = await product.find();
        const SportCategory = await category.find({categoryName:"Sport"});
        const ClassicCategory = await category.find({categoryName:"Classic"});
        res.render("addOffer",{categoryData,productData});
    }catch(err){
        console.log(err);
    }

};



exports.getEditOffer = async (req, res) => {

    try {
       
        const categoryData = await category.find();
        const productData = await product.find();
        const offerId = req.params.id;
        const offerData = await offer.findById(offerId);
        res.render("editOffer",{offerId,categoryData,productData,offerData});


    }catch(error){
        console.log(error);
    }
    
}

exports.getRefferalOffer = async (req, res) => {
    
    try {
        const errorMessage = req.flash("errorMessage");
        const successMessage = req.flash("successMessage");
        const offerData = await reffreal.find();

        res.render("refferalOffer",{offerData ,errorMessage:errorMessage,successMessage:successMessage});
    }catch(err){
        console.log(err);
    }
}


exports.getEditRefgfferalOffer = async (req, res) => {
  
    try {
        const offerId = req.params.id;
        const errorMessage = req.flash("errorMessage");
        const successMessage = req.flash("successMessage");
        const offerData = await reffreal.findById(offerId);
        res.render("editRefferalOffer",{offerId,offerData,errorMessage:errorMessage,successMessage:successMessage});

    }catch(error){
        console.log(error);
    }
}


exports.getProductOffer = async (req, res) => {
    
    try {
        const errorMessage = req.flash("errorMessage");
        const successMessage = req.flash("successMessage");

        const offerData = await product.find({productOffer:{$gt:0}});
        const productData = await product.find();
        
        res.render("productOffer",{offerData,errorMessage:errorMessage,successMessage:successMessage,productData});
    }catch(err){
        console.log(err);
    }
}



exports.getEditProductOffer = async (req, res) => {
    
    try {
        const offerId = req.params.id;
        const errorMessage = req.flash("errorMessage");
        const successMessage = req.flash("successMessage");

        const offerData = await product.findById(offerId);

        res.render("editProductOffer",{offerId,offerData,errorMessage:errorMessage,successMessage:successMessage});

    }catch(err){
        console.log(err);
    }
};


exports.getEditCoupon = async (req, res) => {
  
    try {
      
        const couponId = req.params.id;
        const errorMessage = req.flash("errorMessage");
        const successMessage = req.flash("successMessage");
      //FindById and update the coupon
        const couponData = await coupon.findById(couponId);
        res.render("editCoupon",{couponId,couponData,errorMessage:errorMessage,successMessage:successMessage});
    }catch(err){
        console.log(err);
    }
}



//////////////////////////////////////////////////////







///////////////////////////////////////////////////////

exports.postAddcoupon = async (req, res) => {

    try {
        
        const inputData = {
            couponCode : req.body.couponCode,
            discount : req.body.discount,
            expiryDate : req.body.expiryDate,
            purchaseAmount : req.body.purchaseAmount,
            minimumPurchaseAmount : req.body.minimumPurchaseAmount
        }
        

        if(!inputData.couponCode || !inputData.discount || !inputData.expiryDate || !inputData.purchaseAmount){
            req.flash("errorMessage", 'Please fill all the fields');
            return res.redirect("/coupon");
        }

        if(inputData.discount < 1 || inputData.discount > 100){
            req.flash("errorMessage", 'Discount should be between 1 and 100');
            return res.redirect("/coupon");
        }

        if(inputData.minimumPurchaseAmount < 1){
            req.flash("errorMessage", 'Minimum Purchase Amount should be greater than 0');
            return res.redirect("/coupon");
        }
        
        if(inputData.purchaseAmount < inputData.minimumPurchaseAmount){
          req.flash("errorMessage", 'Purchase Amount should be greater than Minimum Purchase Amount');
          return res.redirect("/coupon");
        }

        if(inputData.purchaseAmount < 1){
            req.flash("errorMessage", 'Purchase Amount should be greater than 0');
            return res.redirect("/coupon");
        }

        if(Date.parse(inputData.expiryDate) < Date.now()){
            req.flash("errorMessage", 'Expiry Date should be greater than today');
            return res.redirect("/coupon");
        }

        if(Date.parse(inputData.expiryDate) < Date.now()){
            req.flash("errorMessage", 'Expiry Date should be greater than today');
            return res.redirect("/coupon");
        }
     
        
        const {
            couponCode,
           
        } = req.body;

        const hasWhiteSpace = (str) => {
            return /\s/g.test(str);
        };

        const fieldsWithWhiteSpace = {};

        if (hasWhiteSpace(couponCode)) {
            fieldsWithWhiteSpace.couponCode = couponCode;
        }

        // if (hasWhiteSpace(description)) {
        //     fieldsWithWhiteSpace.description = description;
        // }

        if (Object.keys(fieldsWithWhiteSpace).length > 0) {
            req.flash("errorMessage", 'Please fill the coupon code');
            return res.redirect("/coupon");
        }


        const newCoupon = new coupon(inputData);
       

        const existingCode = await coupon.findOne({couponCode: newCoupon.couponCode});

        if(existingCode){
            req.flash("errorMessage", "Coupon code already exists");
            return res.redirect("/coupon");
        }

        const savedCoupon = await newCoupon.save();

        req.flash("successMessage", "Coupon code added successfully");
        res.redirect("/coupon");
       
    }catch(err){

        res.status(500).json(err);
        console.log(err);
    }

}


exports.postDeleteCoupon = async (req, res) => {
    
    try {
        
      const couponId = req.params.id;

      const deletedItem = await coupon.findByIdAndDelete(couponId);

      if(!deletedItem){
        req.flash("errorMessage", "Coupon code not found");
       }

     req.flash("successMessage", "Coupon deleted successfully"); 
     res.redirect("/coupon");


    }catch(error){
      console.log("Error occurred in postDeleteCoupon:", error);
    }
}


exports.postOffer = async (req, res) => {
    
    try {
        
      const inputData = {
       
        discount : req.body.discount,
        startDate : req.body.startDate,
        endDate : req.body.endDate,
        category : req.body.category,
        isActive : req.body.isActive,

      }

      if(!inputData.discount || !inputData.startDate || !inputData.endDate || !inputData.category){
        req.flash("errorMessage", "Please fill all the fields");
        return res.redirect("/offer");
      }

      const newOffer = new offer(inputData);

      const savedOffer = await newOffer.save();

      req.flash("successMessage", "Offer added successfully");
      res.redirect("/offer");



    }catch(err){
    
        console.log(err);
    }

};



exports.postEditOffer = async (req, res) => {
    
    try {
        
      const offerId = req.params.id;
      
      const inputData = {
      
        discount : req.body.discount,
        startDate : req.body.startDate,
        endDate : req.body.endDate,
        category : req.body.category,
        isActive : req.body.isActive,
      }

     

      if(!inputData.discount || !inputData.startDate || !inputData.endDate || !inputData.category){
        req.flash("errorMessage", "Please fill all the fields");
        return res.redirect("/offer");
      }

      if(!offerId){
        req.flash("errorMessage", "Offer not found");
        return res.redirect("/offer");
      }

     

      const updatedOffer = await offer.findByIdAndUpdate(offerId, inputData);
      req.flash("successMessage", "Offer updated successfully");
      res.redirect("/offer");
    }catch(err){
        console.log(err);
    }
}



exports.postDeleteOffer = async (req, res) => {
    
    try {
        
      const offerId = req.params.id;

      const deletedItem = await offer.findByIdAndDelete(offerId);

      if(!deletedItem){
          
        req.flash("errorMessage", "Offer not found");
        return res.redirect("/offer");

      }

      req.flash("successMessage", "Offer deleted successfully");
      res.redirect("/offer");

      }catch(error){
        console.log("Error occurred in postDeleteOffer:", error);
      }
};





exports.postRefferalOffer = async (req, res) => {
    
    try {
        
      const inputData = {
          
        
        percentage : req.body.percentage,
        refferalAmound:req.body.refferalAmound,
        isActive : req.body.isActive,

      }
     
      if( !inputData.percentage || !inputData.refferalAmound){
        req.flash("errorMessage", "Please fill all the fields");
        return res.redirect("/refferalOffer");
      }

      if( inputData.percentage < 0 || inputData.refferalAmound < 0){
        req.flash("errorMessage", "Percentage and Refferal amount cannot be negative");
        return res.redirect("/refferalOffer");
      }

      if(inputData.percentage < 1 || inputData.refferalAmound < 1){
        req.flash("errorMessage", "Percentage and Refferal amount cannot be less than 1");
        return res.redirect("/refferalOffer");
      }

      if( inputData.percentage > 100){
        req.flash("errorMessage", "Refferal amount cannot be greater than 100");
      }

      if(inputData.percentage.trim() === "" || inputData.refferalAmound.trim() === ""){
        req.flash("errorMessage", "Please fill all the fields");
        return res.redirect("/refferalOffer");
      }


      const newRefferalOffer = new reffreal(inputData);
      
      const savedRefferalOffer = await newRefferalOffer.save();

      req.flash("successMessage", "Refferal offer added successfully");
      res.redirect("/refferalOffer");
    }catch(err){
        console.log(err);
    }
}




exports.deleteRefferalOffer = async (req, res) => {
    
    try {
        
      const refferalId = req.params.id;

      const deletedItem = await reffreal.findByIdAndDelete(refferalId);

      if(!deletedItem){
        req.flash("errorMessage", "Refferal offer not found");
        res.redirect("/refferalOffer");
      }

      req.flash("successMessage", "Refferal offer deleted successfully");
      res.redirect("/refferalOffer");

    }catch(err){
        console.log(err);
    }

};


exports.postEditRefferalOffer = async (req, res) => {

    try {
      
        const refferalId = req.params.id;

        const inputData = {
          
            percentage : req.body.percentage,
            refferalAmound:req.body.refferalAmound,
            isActive : req.body.isActive,
        }

        if( !inputData.percentage || !inputData.refferalAmound){
          
            req.flash("errorMessage", "Please fill all the fields");
            return res.redirect(`/editRefferalOffer/${refferalId}`);
        }

        if( inputData.percentage < 0 || inputData.refferalAmound < 0){
          
            req.flash("errorMessage", "Percentage and Refferal amount cannot be negative");
            return res.redirect(`/editRefferalOffer/${refferalId}`);

        }

        if(inputData.percentage < 1 || inputData.refferalAmound < 1){
          
            req.flash("errorMessage", "Percentage and Refferal amount cannot be less than 1");
            return res.redirect(`/editRefferalOffer/${refferalId}`);

        }

        if( inputData.percentage > 100){
          
            req.flash("errorMessage", "Refferal amount cannot be greater than 100");
            return res.redirect(`/editRefferalOffer/${refferalId}`);

        }

        if(inputData.percentage.trim() === "" || inputData.refferalAmound.trim() === ""){
          
            req.flash("errorMessage", "Please fill all the fields");
            return res.redirect(`/editRefferalOffer/${refferalId}`);

        }

       

        const updatedRefferalOffer = await reffreal.findByIdAndUpdate(refferalId, inputData);

        req.flash("successMessage", "Refferal offer updated successfully");
        res.redirect("/refferalOffer");




        }catch(err){
            console.log(err);
        }
  
};





exports.postAddProductOffer = async (req, res) => {
  
    try {
        
      const inputData = {
        productName : req.body.productName,
        discountAmount: req.body.discountAmount,
      }
      const productData = await product.find({productName:{$in:inputData.productName}});
     
      const price = productData[0].price;


      if( !inputData.productName || !inputData.discountAmount){
        req.flash("errorMessage", "Please fill all the fields");
        return res.redirect("/productOffer");
      }

      if( inputData.discountAmount < 0){
        req.flash("errorMessage", "Discount amount cannot be negative");
        return res.redirect("/productOffer");
      }

      if(inputData.discountAmount < 1){
        req.flash("errorMessage", "Discount amount cannot be less than 1");
        return res.redirect("/productOffer");
      }
      
      if( inputData.discountAmount > price){
        req.flash("errorMessage", "Discount amount cannot be greater than the product price");
        return res.redirect("/productOffer");
      }

      if( inputData.discountAmount == price){
        req.flash("errorMessage", "Discount amount cannot be equal to the product price");
        return res.redirect("/productOffer");
      }
      

      // update the discountAmount in product collection 

      const updatedProduct = await product.findByIdAndUpdate(productData[0]._id, {productOffer: inputData.discountAmount});
      console.log("updatedProduct", updatedProduct);

      req.flash("successMessage", "Product offer added successfully");
      res.redirect("/productOffer");
            

      }catch(err){

        console.log(err);

      }

};






exports.postEditProductOffer = async (req, res) => {
    
    try {
        
      const offerId = req.params.id;

      const inputData = {
        productOffer: req.body.productOffer,
        isActive : req.body.isActive,
      }


      const productData = await product.find({_id:offerId});
     
      const price = productData[0].price;



      if( inputData.productOffer > price){
        req.flash("errorMessage", "Discount amount cannot be greater than the product price");
        return res.redirect(`/editProductOffer/${offerId}`);
      }

      if( inputData.productOffer == price){
        req.flash("errorMessage", "Discount amount cannot be equal to the product price");
        return res.redirect(`/editProductOffer/${offerId}`);
      }



      if( !inputData.productOffer){
        req.flash("errorMessage", "Please fill all the fields");
        return res.redirect(`/editProductOffer/${offerId}`);
      }

      if( inputData.productOffer < 0){
        req.flash("errorMessage", "Percentage cannot be negative");
        return res.redirect(`/editProductOffer/${offerId}`);
      }

      if(inputData.productOffer < 1){
        req.flash("errorMessage", "Percentage cannot be less than 1");
        return res.redirect(`/editProductOffer/${offerId}`);
      }

      if( inputData.productOffer > 100){
        req.flash("errorMessage", "Percentage cannot be greater than 100");
        return res.redirect(`/editProductOffer/${offerId}`);
      }

      if(inputData.productOffer.trim() === ""){
            req.flash("errorMessage", "Please fill all the fields");
            return res.redirect(`/editProductOffer/${offerId}`);
      }

      const updatedProductOffer = await product.findByIdAndUpdate(offerId, inputData);

      req.flash("successMessage", "Product offer updated successfully");
      res.redirect("/productOffer");


    }catch(err){
        console.log(err);
    }

};



exports.postDeleteProductOffer = async (req, res) => {
    
    try {
        
      const offerId = req.params.id;

     

      const deletedItem = await product.findByIdAndUpdate(offerId, {productOffer: 0});
      
      if(!deletedItem){
        req.flash("errorMessage", "Product offer not found");
        res.redirect("/productOffer");
      }

      req.flash("successMessage", "Product offer deleted successfully");
      res.redirect("/productOffer");

    }catch(err){
        console.log(err);
    }

};


exports.postEditCoupon = async (req, res) => {
  
  try {
    
    const couponId = req.params.id;

    const inputData = {
      couponCode: req.body.couponCode,
      discount : req.body.discount,
      expiryDate : req.body.expiryDate,
      purchaseAmount : req.body.purchaseAmount,
      minimumPurchaseAmount : req.body.minimumPurchaseAmount,
    }

    if( !inputData.couponCode || !inputData.discount || !inputData.expiryDate || !inputData.purchaseAmount){
      req.flash("errorMessage", "Please fill all the fields");
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if( inputData.discount < 0 || inputData.purchaseAmount < 0){
      req.flash("errorMessage", "Discount and Purchase amount cannot be negative");
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if(inputData.discount < 1 || inputData.purchaseAmount < 1){
      req.flash("errorMessage", "Discount and Purchase amount cannot be less than 1");
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if( inputData.discount > 100){
      req.flash("errorMessage", "Discount cannot be greater than 100");
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if(inputData.couponCode.trim() === "" || inputData.discount.trim() === "" || inputData.expiryDate.trim() === "" || inputData.purchaseAmount.trim() === ""){
      req.flash("errorMessage", "Please fill all the fields");
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if(Date.parse(inputData.expiryDate) < Date.now()){
      req.flash("errorMessage", 'Expiry Date should be greater than today');
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if(inputData.minimumPurchaseAmount < 1){
      req.flash("errorMessage", 'Minimum Purchase Amount should be greater than 0');
      return res.redirect(`/editCoupon/${couponId}`);
    }

    if(inputData.purchaseAmount < inputData.minimumPurchaseAmount){
      req.flash("errorMessage", 'Purchase Amount should be greater than Minimum Purchase Amount');
      return res.redirect(`/editCoupon/${couponId}`);
    }

    const updatedCoupon = await coupon.findByIdAndUpdate(couponId, inputData);

    req.flash("successMessage", "Coupon updated successfully");
    res.redirect("/coupon");

  }catch (err){
    console.log(err);
  }
}
///////////////////////////////////////////////////////