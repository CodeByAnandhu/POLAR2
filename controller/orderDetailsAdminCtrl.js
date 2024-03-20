const express = require("express");
const router = express();
const Order = require("../model/orderModel");
const User = require("../model/userModel");
const PDFDocument = require('pdfkit');
const fs = require('fs');  
const ExcelJS = require('exceljs');
// const { createCanvas, registerFont } = require('canvas');
const pdfMake = require('pdfmake');

 
//Get
/////////////////////////////////////////////////////////////
exports.getOrderDetails = async (req, res) => {
    try {
       
        const orderData = await Order.find();

        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        const limit = 7; 
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const results = {};

        // Calculate pagination information
        if (endIndex < orderData.length) {
            results.next = {
                page: page + 1,
                limit: limit
            };
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            };
        }

        // Slice the data array to return only the data for the current page
        results.current = orderData.slice(startIndex, endIndex);

        // Pass the limit to the EJS template
        res.render("orderDetails", { orderData: results.current, pagination: results, limit: limit });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}








exports.salesReport = async (req, res) => {
    try {
       
        let orderData = await Order.find();
       

        const orders = [];
        const users = [];


      
const searchTerm = req.query.search;
if (searchTerm) {
   
    orderData = orderData.filter(order => {
       
        
      
        if (order.address.name.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
        }

    
        const billingAddress = Object.values(order.address).join(' ').toLowerCase();
        if (billingAddress.includes(searchTerm.toLowerCase())) {
            return true;
        }

       
        if (order.totalQuantity.toString().includes(searchTerm)) {
            return true;
        }

       
        if (order.totalPrice.toString().includes(searchTerm)) {
            return true;
        }

      
        if (order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) {
            return true;
        }

        
        const searchTermDate = new Date(searchTerm);
        if (!isNaN(searchTermDate) && order.orderDate.getTime() === searchTermDate.getTime()) {
            return true;
        }

        

        return false;
    });
}


        for (const order of orderData) {
            const user = await User.findById(order.userId);
            orders.push(order);
            users.push(user);
        }

        // Sorting 
        let sortedOrders = orderData;
        const sortOption = req.query.sort || 'yearly'; 
        switch (sortOption) {
            case 'daily':
                const todayDaily = new Date();
                const startOfDay = new Date(todayDaily.getFullYear(), todayDaily.getMonth(), todayDaily.getDate());
                const endOfDay = new Date(todayDaily.getFullYear(), todayDaily.getMonth(), todayDaily.getDate() + 1);
                sortedOrders = sortedOrders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startOfDay && orderDate < endOfDay;
                });
                break;
            case 'weekly':
                const todayWeekly = new Date();
                const startOfWeek = new Date(todayWeekly.getFullYear(), todayWeekly.getMonth(), todayWeekly.getDate() - todayWeekly.getDay()); // Start of current week
                const endOfWeek = new Date(todayWeekly.getFullYear(), todayWeekly.getMonth(), todayWeekly.getDate() - todayWeekly.getDay() + 7); // End of current week
                sortedOrders = sortedOrders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= startOfWeek && orderDate < endOfWeek;
                });
                break;
            case 'yearly':
                const currentYear = new Date().getFullYear();
                sortedOrders = sortedOrders.filter(order => new Date(order.orderDate).getFullYear() === currentYear);
                break;
            case 'custom':
                const customDate = req.query.date; // Assuming the parameter is named "date"
                const selectedDate = new Date(customDate);
                const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1); // Add one day to include orders from the selected date
                sortedOrders = sortedOrders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= selectedDate && orderDate < endDate;
                });
                break;
            default:
                break;
        }
        // Sorting
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = 7;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const ordersToShow = sortedOrders.slice(startIndex, endIndex);

        res.render("salesReport", { orders: ordersToShow, users, orderData, page, limit });


    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
};





exports.downloadSalesReport = async (req, res) => {
    try {
      const orders = await Order.find();
  
      // Create a PDF document
      const doc = new PDFDocument();
      const filename = "sales_report.pdf";
  
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
  
      doc.pipe(res);
  
      // Add content to the PDF document
      doc.text("Sales Report", { align: "center", fontSize: 10, margin: 2 });
  
      // Draw the table headers
      doc.moveDown(); 
      doc.fontSize(10);
      const tableHeaders = [
        "Username",
        "Product Name",
        "Price",
        "Quantity",
        "Address",
        "City",
        "Pincode",
        "State",
      ];
      drawTableRow(doc, tableHeaders);
  
      // Draw the table rows
      orders.forEach(order => {
        order.products.forEach(product => {
          const rowData = [
            order.address.name,
            product.productName,
            product.price.toString(),
            product.quantity.toString(),
            order.address.address,
            order.address.city,
            order.address.pincode,
            order.address.state,
          ];
          drawTableRow(doc, rowData);
        });
      });
  
      // Finalize the PDF document
      doc.end();
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  
  function drawTableRow(doc, rowData) {
    const rowHeight = 20;
    const cellWidth = doc.page.width / rowData.length;
  
    rowData.forEach((cell, i) => {
      doc.text(cell, i * cellWidth + 10, doc.y, { width: cellWidth - 10, height: rowHeight, lineBreak: false });
    });
  
    // Draw borders
    const x = doc.x - 10;
    const y = doc.y - rowHeight;
    const endY = y + rowHeight;
    const endX = x + doc.page.width;
    doc.moveTo(x, y).lineTo(endX, y).stroke(); 
    doc.moveTo(x, endY).lineTo(endX, endY).stroke(); 
    for (let i = 0; i <= rowData.length; i++) {
      doc.moveTo(x + i * cellWidth, y).lineTo(x + i * cellWidth, endY).stroke(); 
    }
    doc.moveDown();
  }



exports.downloadSalesReportExcel = async (req, res) => {
    try {
        // Fetch orders from the database
        const orders = await Order.find().populate('userId');

        // Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Define columns for the worksheet
        worksheet.columns = [
            { header: 'Order Number', key: 'orderNumber', width: 15 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
            { header: 'Address', key: 'address', width: 30 },
            { header: 'Locality', key: 'locality', width: 15 },
            { header: 'Pincode', key: 'pincode', width: 15 },
            { header: 'State', key: 'state', width: 15 },
            { header: 'Phone Number', key: 'phone', width: 15 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Payment Method', key: 'paymentMethod', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'Product Name', key: 'productName', width: 20 },
            { header: 'Quantity', key: 'quantity', width: 15 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Discount Price', key: 'discountPrice', width: 15 },
        ];

        // Add data to the worksheet
        orders.forEach(order => {
            order.products.forEach(product => {
                worksheet.addRow({
                    orderNumber: order.orderNumber,
                    customerName: order.address.name,
                    address: order.address.address,
                    locality: order.address.locality || '',
                    pincode: order.address.pincode,
                    state: order.address.state,
                    phone: order.address.phone,
                    email: order.userId.email,
                    paymentMethod: order.paymentMethod,
                    orderDate: order.orderDate.toDateString(),
                    productName: product.productName,
                    quantity: product.quantity,
                    price: product.price,
                    discountPrice: product.discountPrice,
                });
            });
        });

        // Set headers for response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        // Write workbook to response
        await workbook.xlsx.write(res);

        // End response
        res.end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

////////////////////////////////////////////////////////////









//Post
////////////////////////////////////////////////////////////


exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const productId = req.body.productId;
        const status = req.body.status;
       

        const updateData = await Order.findOneAndUpdate(
            { _id: orderId, "products.productId": productId }, 
            { $set: { "products.$.status": status } }, 
            { new: true }
        ); 
        
        
        if (!updateData) {
            return res.status(404).json({ success: false, message: 'Order or Product not found' });
        }
        console.log("Status updated successfully to", status);
        res.json({ 

            success: true,
            message: 'Order status updated successfully', 
            data: updateData ,
            status : status,   
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
}




////////////////////////////////////////////////////////////

