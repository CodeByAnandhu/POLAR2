
const express = require("express");
const router = express.Router();
const authController = require('../controller/userCtrl');
const sessionHandler = require("../middleware/sessionHandler");



//Get Routes
///////////////////////////////////////////////////////
const { 

    getLogin,
    getRegister,
    getOtp,
    getLogout,
    getForgetPassword,
    getVerifyEmailCode,
    getResetPassword,

} = require("../controller/userCtrl");

// Login Get Router
router.get("/login", getLogin);
router.get("/getRegister",getRegister);
router.get("/getOtp",getOtp);
router.get("/logout",getLogout);
router.get("/forgetPassword",getForgetPassword);
router.get("/verifyEmailCode",getVerifyEmailCode);
router.get("/resetPassword",getResetPassword);
///////////////////////////////////////////////////////




//Post
///////////////////////////////////////////////////////
const {  
    postLogin,
    postRegister,
    postOtp,
    postLogout,
    resendotp,
    postForgetPassword,
    postVerificationCode,
    postResetPassword,
} = require("../controller/userCtrl");

 
router.post("/login",postLogin);
router.post("/Register",postRegister);
router.post("/getOtp",postOtp);
router.post("/logout",postLogout);  
router.post("/resendotp",resendotp); 
router.post("/forgetPassword",postForgetPassword);
router.post("/verifyEmailCode",postVerificationCode);
router.post("/resetPassword",postResetPassword);
///////////////////////////////////////////////////////



module.exports = router;




