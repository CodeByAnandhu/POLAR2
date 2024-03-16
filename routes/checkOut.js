const express = require("express");
const router = express.Router();
const sessionControll = require("../middleware/sessionHandler");

//get Router
///////////////////////////////////////
const {
    
    getCheckout,
    orderPlaced,
    orderDetailsUser,
    paymentSuccess,
    resonForReturn,
    downloadInvoice,
    moreDetailsOrder

}=require("../controller/checkoutCtrl");

router.get("/checkout",sessionControll,getCheckout);
router.get("/OrderPlaced",sessionControll,orderPlaced);
router.get("/orderDetailsUser",sessionControll,orderDetailsUser);
router.get("/paymentSuccess",sessionControll,paymentSuccess);
router.get("/resonForReturn",sessionControll,resonForReturn);
router.get("/downloadInvoice",sessionControll,downloadInvoice);
router.get("/moreDetailsOrder/:orderNumber",sessionControll,moreDetailsOrder);


/////////////////////////////////////////




//post Router
/////////////////////////////////////////

const {

    postAddAddress,
    postOrder,
    cancelOrder,
    returnOrder,
    rezorPay,
    postOrder2ForRazorPay,
    postCancel,

 }=require("../controller/checkoutCtrl");

const { route } = require("./shop");

router.post("/addAddressInCheckOut",sessionControll,postAddAddress);
router.post("/order",sessionControll,postOrder);
router.post("/return/:productId/:orderNumber",sessionControll,returnOrder);
router.post("/create/:orderId",sessionControll,rezorPay);
router.post("/order2ForRazorPay",sessionControll,postOrder2ForRazorPay);
router.post("/cancelOrder/:productId/:orderNumber",sessionControll,postCancel);
/////////////////////////////////////////


module.exports = router;
