const express = require("express");
const router = express.Router();
const sessionControll = require("../middleware/sessionHandler");
const multerInstance = require("../middleware/multer");

//Get Router
//////////////////////////////////////////////////////////
const {

    
    getEnergy,
    getHome,
    getClassic,
    sortClassic,
    getHome1,  
    getProductDetails,
    wishList,
    pageNotFound404, 
    addToWishlist,
    

} = require("../controller/shopCtrl");

router.get("/getEnergy",sessionControll,getEnergy);
router.get("/",getHome1);
router.get("/getHome",sessionControll,getHome);
router.get("/classic",sessionControll,getClassic);
router.get("/getProductDetails/:id",sessionControll,getProductDetails);
router.get("/getEnergy/:sortBy", sessionControll, getEnergy);
router.get("/classic/:sortBy",sessionControll,sortClassic);
router.get("/wishlist",sessionControll,wishList);
router.get("/pageNotFound404",pageNotFound404);
router.get("/addToWishlist/:id",sessionControll,addToWishlist);
//////////////////////////////////////////////////////////////








//Post Router
/////////////////////////////////////////////////////////////


const {
    postWishList,
    deleteWishList,
}=require("../controller/shopCtrl");


router.post("/wishlist/:id",sessionControll,postWishList);
router.post("/deleteWishList/:id",sessionControll,deleteWishList);

//////////////////////////////////////////////////////////////

module.exports = router;