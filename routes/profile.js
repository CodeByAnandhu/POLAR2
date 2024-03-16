const express = require("express");
const router = express.Router();
const uploads = require("../middleware/multer");
const sessionControll = require("../middleware/sessionHandler");
//Get Router
///////////////////////////////////////////////////
const {

    getProfile,
    getProfileEdit,
    getAddress,
    getEditAddress,
    getAddAddress,
    getRazerPay,
    getCouponsUser
    
} = require("../controller/profileCtrl");

router.get("/profile",sessionControll,getProfile);
router.get("/editProfile",sessionControll,getProfileEdit);
router.get("/address",sessionControll,getAddress);
router.get("/editAddress/:id",sessionControll,getEditAddress);
router.get("/addAddress",sessionControll,getAddAddress);
router.get("/getrazorPay",getRazerPay);
router.get("/couponsUser",sessionControll,getCouponsUser);

///////////////////////////////////////////////////





//Post Router
///////////////////////////////////////////////////
const {

    postEditProfile,
    postAddAddress,
    updateAddress,
    deleteAddress,
    walletTopUp,
    razorpayWebhook,
    withdrawalAmount,
    postCouponApply,
    cancelCoupon,

} = require("../controller/profileCtrl");

router.post("/editProfile",uploads,postEditProfile);
router.post("/addAddress",sessionControll,postAddAddress);
router.post("/updateAddress/:id",sessionControll,updateAddress);
router.post("/deleteAddress/:id",sessionControll,deleteAddress);
router.post("/walletTopUp",sessionControll,walletTopUp);
router.post("/withdrawalAmount",sessionControll,withdrawalAmount);
router.post("/razorpayWebhook",razorpayWebhook);
router.post("/couponApply",sessionControll,postCouponApply);
router.post("/cancelCoupon",sessionControll,cancelCoupon);

///////////////////////////////////////////////////


module.exports = router;
