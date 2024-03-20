const express = require("express");
const router = express.Router();
const sessionHandler = require("../middleware/AdminSessionHandler");

//get 
const {

  getAdminLogin,
  getInsite,
  userManage,
  logOut,
  helper,

} = require("../controller/adminCtrl");

//Get Routers
router.get("/adminLogin", getAdminLogin);
router.get("/Insite",sessionHandler,getInsite);
router.get("/UserManage",sessionHandler, userManage);
router.get("/logout",sessionHandler, logOut);
router.get("/helper", helper);

//Get Routers

//post
const {

  AdminPostLogin,
  blockUser,
 

} = require("../controller/adminCtrl");

//Post Routers
router.post("/adminLogin", AdminPostLogin);
router.post("/blockUser/:userId",sessionHandler, blockUser);

module.exports = router;
