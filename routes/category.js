const express = require("express");
const router = express.Router();
const sessionHandler = require("../middleware/AdminSessionHandler");



//get Routes
//////////////////////////////////////////////////////////
const {

    categorys,
    getaddCategory,
    getEditCategory,

}=require("../controller/categoryCtrl")


router.get("/Category", sessionHandler,categorys);
router.get("/addCategory",sessionHandler, getaddCategory);
router.get("/editCategory/:categoryId",sessionHandler, getEditCategory);

//////////////////////////////////////////////////////////





//Post Routes
//////////////////////////////////////////////////////////
const {

    postAddCategory,
    deleteCategory,
    postEditCategory,
    

} = require("../controller/categoryCtrl")


router.post("/add_category", sessionHandler,postAddCategory);
router.post("/deleteCategory/:categoryId",sessionHandler, deleteCategory);
router.post("/editCategory/:categoryId",sessionHandler, postEditCategory);

//////////////////////////////////////////////////////////


module.exports = router;
