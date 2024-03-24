const express = require("express");
const router  = express();
const USERDATA = require("../model/userModel");
const PRODUCTDATA = require("../model/addProductModel");
const Cart = require("../model/cartModel")
const flash = require("connect-flash");
const user = require("../model/userModel");
const offer = require("../model/offerModel");



//Get Controll
/////////////////////////////////////////////////////////////////////////////

exports.getCart = async (req, res) => {

    try { 

        const userId = req.session.user; 

        const CategoryOfferPrice = await offer.find({ isActive: true });
        
        
        const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
        
        const productData = await PRODUCTDATA.find({ isVisible: true, isActive: true});
        
        const userCart = await Cart.find({ userId: userId });
        
        var errorMessage = req.flash("errorMessage");
        

        let totalPrice = 0;

        let totalQuantity = 0; 

        let discountedTotalPrice = 0; 

        let discountedPrices = []; 


        userCart.forEach(item => {

            let itemTotalPrice = item.price * item.quantity;

            totalPrice += itemTotalPrice;

            totalQuantity += item.quantity; 

            if (CategoryOfferPrice.find(offer => offer.category === item.category)) {

                let discountedPrice = item.price - (categoryOffer * item.price / 100);

                discountedPrices.push(discountedPrice); 

                discountedTotalPrice += discountedPrice * item.quantity; 
                
            } else {
                discountedPrices.push(item.price); 
            }
        });

        

        const finalPrice = totalPrice - discountedTotalPrice;

       

        res.render("cart", { 
            Cart: userCart, 
            totalPrice: totalPrice, 
            totalQuantity: totalQuantity, 
            discountedTotalPrice: discountedTotalPrice,
            finalPrice: finalPrice,
            errorMessage: errorMessage,
            discountedPrices: discountedPrices, 
            CategoryOfferPrice, 
            
        });
       
    } catch (error) {
        console.log("Error Occurred in getCart", error);
        res.render("pageNotFound404");
    }
};



 
//////////////////////////////////////////////////////////////////////////////


 











//Post Controll
//////////////////////////////////////////////////////////////////////////////
exports.postAddToCart = async (req, res) => {

    try {

        const productId = req.params.id;

        const product = await PRODUCTDATA.findById(productId);
  

        console.log("product", product);
        if (!product) {
            return res.status(404).send("Product not found");
        }



        const userId = req.session.user;

        const userCartItemsCount = await Cart({ userId });
        if (userCartItemsCount.quantity >= 10) {
           
            return res.render("cart", { message: "Maximum limit reached" });
        }
  
        const existingCartItem = await Cart.findOne({ userId, productId });
  
        if (existingCartItem) {
          
          if (existingCartItem.quantity + 1 > product.stock) {
            return res.render("cart", { message: "Product out of stock" });
            // return  res.json({message: "Product out of stock"});

          }
  
            existingCartItem.quantity += 1;
            await existingCartItem.save();
  
        } else {
            const cartItem = {
                userId : userId,
                productId: product._id,
                productName: product.productName,
                category: product.selectCategory,
                price: product.price,
                quantity: 1,
                productImage: product.productImage,
            };
  
            await Cart.create(cartItem);
        }
  
        res.redirect("/cart");
    } catch (err) {
        console.error("Error while adding to cart:", err);
        res.render("pageNotFound404");
    }
  };
  



exports.updateCart = async (req, res) => {
 
   
    try {
        const UserId = req.session.user
        const { itemId , quantity } = req.body;
       
        const CategoryOfferPrice = await offer.find({ isActive: true });
      
        const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
        

        const product = await PRODUCTDATA.findOne({ _id: itemId });
        
        if (!product) {
            console.log("Product not found");
            return res.render("cart", {
                message: "Product not found",
            });
        }
   
        if (quantity >= product.stockCount) {

             res.json({
                success: false,
                insufficientStock: quantity > product.stockCount,
                message: "Insufficient stock",
                Quantity: quantity,
                ProductStock: product.stockCount,
            }); 
           
        }
        
       


        
        const updateQuantity = await Cart.findOneAndUpdate(
            { userId:UserId, productId: itemId  }, 
            { $set: { quantity: quantity } }, 
            { new: true } 
        );
      
       
         
        if (updateQuantity) {

            
           
            const cartItems = await Cart.find({userId:UserId});
           
            const totalQuantity = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
            
            const fetchPromises = cartItems.map(async (item) => {
                if(CategoryOfferPrice.find(offer => offer.category === item.category)) {
                    const discountedPrice = item.price - (categoryOffer * item.price / 100);
                    return discountedPrice * item.quantity;
                }
                const itemProduct = await PRODUCTDATA.findOne({ _id: item.productId });
                return item.quantity * itemProduct.price;
            });

            
           
            const prices = await Promise.all(fetchPromises);
            

             
            
            const totalPrice = prices.reduce((acc, curr) => acc + curr, 0);
            
            
            return res.json({
                success: true,
                totalQuantity: totalQuantity,
                totalPrice: totalPrice,
                insufficientStock: quantity > product.stockCount,
                errorMessage: "Insufficient stock",
                Quantity: quantity,
                ProductStock: product.stockCount,
            });
            
            
            
        } else {
           
            return res.json({ success: false, message: "Cart update failed" });
        }
    } catch (err) {
        
        console.error("Error while updating cart:", err);
        res.render("pageNotFound404");
    }
};



exports.deleteCartItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        const userId = req.session.user; 
       
        const deletedItem = await Cart.findOneAndDelete({ productId: itemId, userId: userId });

        if (!deletedItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        return res.redirect("/cart");
    } catch (err) {
        console.log(err);
        res.render("pageNotFound404");
    }
};




//////////////////////////////////////////////////////////////////////////////
 

