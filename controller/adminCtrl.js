const express = require("express");
const router = express();
const bcrypt = require("bcrypt");
const mongoose = require("../config/dbConnect");
const Admin = require("../model/adminModel");
const userData = require("../model/userModel");
const Orders = require("../model/orderModel");
const flash = require("connect-flash");




// Get Controll
/////////////////////////////////////////////////////////////////////////
exports.getAdminLogin = (req, res) => {
  const errorMessage = req.flash("errorMessage");
  res.render("adminlogin", { errorMessage });
};
  











function calculateTopPosition(order) {
 
  return order * 10;
}

exports.getInsite = async (req, res) => {

  try {
      // Fetch orders count
      const ordersCount = await Orders.countDocuments({});  

      const topTenSaledProducts = await Orders.aggregate([
        { $unwind: '$products' },
        { $match: { 'products.status': 'Delivered' } },
        { $group: { 
            _id: '$products.productId', 
            totalQuantity: { $sum: '$products.quantity' },
            totalPrice: { $sum: '$products.price' },
            image: { $first: '$products.productImage' },
            name: { $first: '$products.productName' } 
        } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
    ]);

    const monthlySales = await Orders.aggregate([
      {
        $group: {
          _id: { $month: '$orderDate' },
          totalSales: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);


    const salesData = [];
    const currentMonth = new Date().getMonth() + 1; 

    for (let i = 1; i <= 6; i++) {
      const monthSales = monthlySales.find(sale => sale._id === i);
      if (monthSales) {
        salesData.push(monthSales.totalSales);
      } else {
        salesData.push(0);
      }
    }



    const yearlySales = await Orders.aggregate([
      {
        $group: {
          _id: { $year: '$orderDate' },
          totalSales: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    const yearlySalesData = yearlySales.map(sale => sale.totalSales);
    


      
     
      const [totalSaleValue, totalQuantity] = await Promise.all([
          Orders.aggregate([
              { $unwind: '$products' },
              { $match: { 'products.status': 'Delivered' } },
              { $group: { _id: null, total: { $sum: '$products.price' } } }
          ]),
          Orders.aggregate([
              { $unwind: '$products' },
              { $match: { 'products.status': 'Delivered' } },
              { $group: { _id: null, totalQuantity: { $sum: '$products.quantity' } } }
          ])
      ]);

      
      const formattedTotalSaleValue = totalSaleValue.length > 0 ? totalSaleValue[0].total : 0;
      const formattedTotalQuantity = totalQuantity.length > 0 ? totalQuantity[0].totalQuantity : 0;
      const monthlyOrders = [25, 8, 13, 5, 23, 12, 15];
      const topPositions = monthlyOrders.map(order => calculateTopPosition(order));
      
      res.render('adminInsite', {
        ordersCount,
        totalSaleValue: formattedTotalSaleValue,
        totalQuantity: formattedTotalQuantity,
        monthlyOrders,
        topPositions,
        topTenSaledProducts,
        salesData,
        yearlySalesData 
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
};









exports.userManage = async (req, res) => {
  try {
      const page = req.query.page || 1;
      const limit = 6; 
      const skip = (page - 1) * limit;
      const totalUsers = await userData.countDocuments();
      const totalPages = Math.ceil(totalUsers / limit);

      const userFind = await userData.find().skip(skip).limit(limit);

      res.render("userMange", { userFind, totalPages, currentPage: page });
  } catch (error) {
      console.log("Error while users find in adminctrl", error);
  }
};



// For Testing Purpose 
exports.helper = (req, res) => {
  res.render("Helper");
}
/////////////////////////////////////////////////////////////////////////








//Post Controll
/////////////////////////////////////////////////////////////////////////
exports.AdminPostLogin = async (req, res) => {
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
      // confirmPassword: req.body.confirmPassword,
    };

    const admin = await Admin.findOne({
      email: data.email,
      password: data.password,
      // confirmPassword: data.confirmPassword,
    });
   

    if (!admin) {
      req.flash("errorMessage", "Wrong data");
      res.render("adminlogin", { errorMessage: req.flash("errorMessage") });
    } else {
      req.session.Admin = admin._id;
      res.redirect("/Insite");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

//UserManagement

//Block User
exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await userData.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.isBlocked = !user.isBlocked;

    const updatedUser = await user.save();
    

    res.redirect("/UserManage");
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    res.status(500).send("Internal Server Error");
  }
};





exports.logOut = (req, res) => {
  try {
      req.session.Admin = null; 
      req.session.save((err) => { 
          if (err) {
              console.error("Error destroying session:", err);
          } else {
              res.redirect("/adminLogin");
          }
      });
  } catch (err) {
      console.log(err);
  }
};

/////////////////////////////////////////////////////////////////////////


