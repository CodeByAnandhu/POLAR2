const express = require("express");
const router = express();
const USERDATA = require("../model/userModel");
const mongoose = require("../config/dbConnect");
const PRODUCTDATA = require("../model/addProductModel");
const Category  =  require("../model/categoryModel")
const WHISHLIST = require("../model/wishListModel")
const offer = require("../model/offerModel");
const flash = require("connect-flash");
const Cart = require("../model/cartModel");



//Get Controll
///////////////////////////////////////////////////////////////////////


exports.getHome1 = (req, res) => { 
  const userSession = req.session.user ? true : false; 
    res.render("Home",{userSession });
  };

exports.getHome = async(req, res) => {
  try{

  isVisibleCategory = await Category.find();
  const userSession = req.session.user ? true : false; 
    res.render("Home" , {userSession,isVisibleCategory});

  }catch(err){
    console.log(err);
    
  }


  };


exports.getClassic = async (req, res) => {
  

  try {


    const CategoryOfferPrice = await offer.find({ isActive: true, category: "Classic" });
    const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
    
  
    const productData = await PRODUCTDATA.find({ isVisible: true, selectCategory: "Classic"});
    
    
    const adjustedProductData = productData.map(product => {
        if (typeof product.price === 'number' && !isNaN(product.price)) {
            
            let discountedPrice = product.price - (product.price * categoryOffer / 100);
            
            let productOffer;
            if (product.productOffer && typeof product.productOffer === 'number') {
              productOffer = (product.price * product.productOffer / 100);
                
            }
            
            discountedPrice = parseFloat(discountedPrice.toFixed(2));
            
            return { ...product, Offerprice: discountedPrice , productOfferPrice:productOffer  };
        } else {
            return product;
        }
    });




    isVisibleCategory = await Category.find();
    

    let showProducts;
    const sortBy = req.params.sortBy; 
    
    switch (sortBy) {
        case 'popularity':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort(/* Add popularity sorting criteria soon */);
            break;
        case 'energy':
            showProducts = await PRODUCTDATA.find({ isVisible: true, selectCategory: "Sport" });
            break;      
        case 'priceLowToHigh':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort({ price: 1 });
            break;
        case 'priceHighToLow':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort({ price: -1 });
            break;
        case 'a-z':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic" }).sort({ productName: 1 });
            break;
        case 'z-a':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort({ productName: -1 });
            break;
        case 'newArrivals':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic" }).sort({ creationDate: -1 });
            break; 
        case 'featured':
            showProducts = await PRODUCTDATA.find({ isVisible: true, isFeatured: true ,selectCategory:"Classic"});
            break;   
        default:
            showProducts = adjustedProductData; 
            break;
    }

    res.render("classic",{showProducts, isVisibleCategory});

} catch (error) {
    console.error(error);
    res.render("pageNotFound404");
}
    
  };  




exports.sortClassic = async (req, res) => {

  try {


          let showProducts;
    const sortBy = req.params.sortBy; 
    
    switch (sortBy) {
        case 'popularity':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort(/* Add popularity sorting criteria soon */);
            break;
        case 'energy':
            showProducts = await PRODUCTDATA.find({ isVisible: true, selectCategory: "Sport" });
            break;     
        case 'priceLowToHigh':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort({ price: 1 });
            break;
        case 'priceHighToLow':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort({ price: -1 });
            break;
        case 'a-z':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic" }).sort({ productName: 1 });
            break;
        case 'z-a':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"}).sort({ productName: -1 });
            break;
        case 'newArrivals':
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic" }).sort({ creationDate: -1 });
            break; 
        case 'featured':
            showProducts = await PRODUCTDATA.find({ isVisible: true, isFeatured: true ,selectCategory:"Classic"});
            break;   
        default:
            showProducts = await PRODUCTDATA.find({ isVisible: true ,selectCategory:"Classic"});
            break;
        }

        res.render("classic",{showProducts});

  }catch (error) {
  console.error(error);
  res.render("pageNotFound404");

   }

  };



  exports.getEnergy = async (req, res) => {
    try {
       
        const CategoryOfferPrice = await offer.find({ isActive: true, category: "Sport" });
        const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
        
      
        const productData = await PRODUCTDATA.find({ isVisible: true, selectCategory: "Sport"});
        
        
        const adjustedProductData = productData.map(product => {
            if (typeof product.price === 'number' && !isNaN(product.price)) {
                
                let discountedPrice = product.price - (product.price * categoryOffer / 100);
                
                let productOffer;
                if (product.productOffer && typeof product.productOffer === 'number') {
                  productOffer = (product.price * product.productOffer / 100);
                    
                }
                
                discountedPrice = parseFloat(discountedPrice.toFixed(2));
                
                return { ...product, Offerprice: discountedPrice , productOfferPrice:productOffer  };
            } else {
                return product;
            }
        });

        
        let showProducts;
        const sortBy = req.params.sortBy; 
        const searchQuery = req.query.q; 
        let baseQuery = { isVisible: true, selectCategory: "Sport" };
       
        if (searchQuery) {
            baseQuery.productName = { $regex: searchQuery, $options: 'i' }; 
        }

        switch (sortBy) {
          case 'popularity':
            showProducts = await PRODUCTDATA.find(baseQuery).sort(/* Add popularity sorting criteria soon */);
            break;
        case 'classic':
            showProducts = await PRODUCTDATA.find({ ...baseQuery, selectCategory: "Classic" });
            break;    
        case 'priceLowToHigh':
            showProducts = await PRODUCTDATA.find(baseQuery).sort({ price: 1 });
            break;
        case 'priceHighToLow':
            showProducts = await PRODUCTDATA.find(baseQuery).sort({ price: -1 });
            break;
        case 'a-z':
            showProducts = await PRODUCTDATA.find(baseQuery).sort({ productName: 1 });
            break;
        case 'z-a':
            showProducts = await PRODUCTDATA.find(baseQuery).sort({ productName: -1 });
            break;
        case 'newArrivals':
            showProducts = await PRODUCTDATA.find(baseQuery).sort({ creationDate: -1 });
            break; 
        case 'featured':
            showProducts = await PRODUCTDATA.find({ ...baseQuery, isFeatured: true });
            break;     
        default:
                showProducts = adjustedProductData; 
                break;
        }

        
        res.render("Energy", { showProducts , productData});
    } catch (error) {
        console.error(error);
        res.render("pageNotFound404");
    }
};







  
  


//Product DetailsPage
exports.getProductDetails = async (req, res) => {
    try {
      const id = req.params.id;
      const productdetails = await PRODUCTDATA.findOne({ _id: id });
      if (!productdetails) {
        res.status(404).send("Product Not found");
      } else {
        res.render("productDetails", {productdetails});
        
      }
    } catch (error) {
      console.log("Error occure in getEditProduct", error);
      res.render("pageNotFound404");
    }
  };
  
  


  exports.wishList = async (req, res) => {
      try {
           
          const user = req.session.user;
          const errorMessage = req.flash("errorMessage");
          const successMessage = req.flash("successMessage");
          const wishList = await WHISHLIST.find({ userId: user });
          res.render("wishList",{wishList , errorMessage: errorMessage, successMessage: successMessage});

          }catch (error) {

          console.log("Error occure in getEditProduct", error);
          res.render("pageNotFound404");
          }
  }


  exports.pageNotFound404 = async (req, res) => {
    
    res.render("pageNotFound404");

  }


  exports.addToWishlist = async (req, res) => {
    
    try {  

        const id = req.params.id;
        const user = req.session.user;

        const product = await PRODUCTDATA.findById(id);
        if (!product) {
          res.status(404).send("Product Not found");
          console.log("Product Not found");
        }
     
        const existingItem = await WHISHLIST.findOne({ productId: id, userId: user });
        if(existingItem){
          return res.redirect("/wishList");
        }

        const newWishList = new WHISHLIST({
          userId : user,
          productId : product._id,
          productName: product.productName,
          productImage: product.productImage,
          price: product.price,
          addedAt: Date.now()
        })

        newWishList.save();

        res.redirect("/wishList");

        }catch(error){
            console.log("Error occure in getEditProduct", error);
            res.render("pageNotFound404");
        }
      }
////////////////////////////////////////////////////////////////////////////  







//Post Controller
//////////////////////////////////////////////////////////////////////////////

exports.postWishList = async (req, res) => {
    
    try {  

        const id = req.params.id;
        const user = req.session.user;

        const product = await PRODUCTDATA.findById(id);
        if (!product) {
          res.status(404).send("Product Not found");
          console.log("Product Not found");
        }
     
        const existingItem = await WHISHLIST.findOne({ productId: id, userId: user });
        if(existingItem){
          return res.redirect("/wishList");
        }

        const newWishList = new WHISHLIST({
          userId : user,
          productId : product._id,
          productName: product.productName,
          productImage: product.productImage,
          price: product.price,
          addedAt: Date.now()
        })

        newWishList.save();

        res.redirect("/wishList");

        }catch(error){
            console.log("Error occure in getEditProduct", error);
            res.render("pageNotFound404");
        }
      }


      exports.deleteWishList = async (req, res) => {
  
        try {
          const id = req.params.id;
          const user = req.session.user;

          const deletedItem = await WHISHLIST.findOneAndDelete({ productId: id, userId: user });
      
          if (!deletedItem) {
            console.log("Item not found in the wishlist.");
            return res.status(404).send("Item not found in the wishlist.");
          }
          
          return res.redirect("/wishList");
      
        } catch(error) {
          console.log("Error occurred in deleteWishList:", error);
          res.render("pageNotFound404");
        }
      
       };



      exports.postAddToCartInWishList = async (req, res) => {

        try {

          const id = req.params.id;
          const user = req.session.user;

          const product = await PRODUCTDATA.findById(id);
          if (!product) {
          
            req.flash("errorMessage", "Product not found");
            return res.redirect("/wishList");
          }
          
          const existingItem = await Cart.findOne({ productId: id, userId: user });
          
          if (existingItem) {
            
              req.flash("errorMessage", "Product Already In Cart");
              return res.redirect("/wishList");

          }else{

            const newCart = new Cart({
                userId : user,
                productId: product._id,
                productName: product.productName,
                category: product.selectCategory, 
                price: product.price,
                quantity: 1,
                productImage: product.productImage,
            })

            await Cart.create(newCart);

          }

          res.redirect("/cart");

         }catch (error) {
      
          console.log("Error occure in getEditProduct", error);
          res.render("pageNotFound404");
         }

    };   
      


//////////////////////////////////////////////////////////////////////////////