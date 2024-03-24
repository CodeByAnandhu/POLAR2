const express = require("express");
const router = express.Router();
const sessionControll = require("../middleware/sessionHandler");


//Get Route
///////////////////////////////////////////////
    const {

        getCart,

    }=require("../controller/cartCtrl");


    router.get("/cart",sessionControll,getCart);


//////////////////////////////////////////////





  
//Post Route
//////////////////////////////////////////////
    const {
        postAddToCart,
        updateCart,
        deleteCartItem, 
    }=require("../controller/cartCtrl")


    router.post("/addToCart/:id",sessionControll,postAddToCart);
    router.post("/update-quantity",sessionControll,updateCart);
    router.post("/delete-cart-item/:id",sessionControll,deleteCartItem);

    module.exports = router;
