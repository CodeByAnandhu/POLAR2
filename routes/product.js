const express = require("express");
const router = express.Router();
const AddProduct = require("../model/addProductModel");
const uploads = require("../middleware/multer");
const sessionHandler = require("../middleware/AdminSessionHandler");

//Get Routes
//////////////////////////////////////////////////////////////
const{

    getProducts,
    addProducts,
    getEditProduct,


}=require("../controller/productControler")

router.get("/Products",sessionHandler, getProducts);
router.get("/AddProduct", sessionHandler,addProducts);
router.get("/editProduct/:id", sessionHandler,getEditProduct);

//////////////////////////////////////////////////////////////





//Post Routes
///////////////////////////////////////////////////////////////
const{
 

    AddProductPost,
    productVisibility,
    deleteProduct,
    editProduct,

}=require("../controller/productControler");

router.post("/AddProduct/:productid", uploads, AddProductPost);
router.post("/updateVisibility/:id", sessionHandler,productVisibility);
router.post("/deleteProduct/:productId",sessionHandler, deleteProduct);
router.post("/editProduct/:id",uploads, editProduct);

///////////////////////////////////////////////////////////////


module.exports = router;