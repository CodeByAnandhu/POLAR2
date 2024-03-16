const express = require("express");
const router = express.Router();
const sessionHandler = require("../middleware/AdminSessionHandler");

//Get
////////////////////////////////////////////////////////////

const {

    getOrderDetails,
    salesReport,
    downloadSalesReport,
    downloadSalesReportExcel,

}=require("../controller/orderDetailsAdminCtrl");

router.get("/AdminOrderDetails",sessionHandler,getOrderDetails);
router.get("/salesReport",sessionHandler,salesReport);
router.get("/download-sales-report",sessionHandler,downloadSalesReport);
router.get("/download-sales-report-excel",sessionHandler,downloadSalesReportExcel);



////////////////////////////////////////////////////////////




//Post
//////////////////////////////////////////////////////////////


const {
    updateOrderStatus,
}=require("../controller/orderDetailsAdminCtrl");

router.post("/updateOrderStatus",sessionHandler,updateOrderStatus);





//////////////////////////////////////////////////////////////

module.exports = router