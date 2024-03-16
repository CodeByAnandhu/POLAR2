const express = require("express");
const router = express.Router();
const sessionHandler = require("../middleware/AdminSessionHandler");



////////////////////////////////////////////////////////
const {

    getCoupon,
    getOffer,
    addOffer,
    getEditOffer, 
    getRefferalOffer, 
    getEditRefgfferalOffer,
    getProductOffer,
    getEditProductOffer,
    getEditCoupon,

} = require("../controller/offer-couponCtrl");

router.get("/coupon",sessionHandler, getCoupon);
router.get("/offer", sessionHandler,getOffer);
router.get("/addOffer",sessionHandler, addOffer);
router.get("/editOffer/:id", sessionHandler,getEditOffer);
router.get("/refferalOffer", sessionHandler,getRefferalOffer);
router.get("/editRefferalOffer/:id", sessionHandler,getEditRefgfferalOffer);
router.get("/productOffer", sessionHandler,getProductOffer);
router.get("/editProductOffer/:id", sessionHandler,getEditProductOffer);
router.get("/editCoupon/:id", sessionHandler,getEditCoupon);

/////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////

const {

    postAddcoupon,
    postDeleteCoupon,
    postOffer,
    postEditOffer,
    postDeleteOffer,
    postRefferalOffer,
    deleteRefferalOffer,
    postEditRefferalOffer,
    postEditProductOffer,
    postDeleteProductOffer,
    postEditCoupon,
    
}= require("../controller/offer-couponCtrl");

router.post("/addcoupon",sessionHandler,postAddcoupon);
router.post("/deleteCoupon/:id",sessionHandler,postDeleteCoupon);
router.post("/offer", postOffer);
router.post("/editOffer/:id",sessionHandler, postEditOffer);
router.post("/deleteOffer/:id",sessionHandler,postDeleteOffer);
router.post("/refferalOffer", sessionHandler,postRefferalOffer);
router.post("/deleteRefferalOffer/:id", sessionHandler,deleteRefferalOffer);
router.post("/editRefferalOffer/:id", sessionHandler,postEditRefferalOffer);
router.post("/editProductOffer/:id", sessionHandler,postEditProductOffer);
router.post("/deleteProductOffer/:id", sessionHandler,postDeleteProductOffer);
router.post("/editCoupon/:id", sessionHandler,postEditCoupon);





//////////////////////////////////////////////////////////
module.exports = router