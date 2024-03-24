const express = require("express");
const address = require("../model/addressModel");
const cart = require("../model/cartModel");
const product = require("../model/addProductModel");
const Order = require("../model/orderModel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Razorpay = require("razorpay");
const Wallet = require("../model/walletTransactions");
const generateOrderNumber = require('../middleware/randomNumberGnrtor');
const { selectFields } = require("express-validator/src/field-selection");
const flash = require("connect-flash");
const PDFDocument  = require('pdfkit');
const fs = require('fs');
const offer = require("../model/offerModel");
const PRODUCTDATA = require("../model/addProductModel");




//Get Controller
///////////////////////////////////////////////////////////////////////////////


exports.getCheckout = async (req, res) => {

    try {

      const userId = req.session.user; 

      const CategoryOfferPrice = await offer.find({ isActive: true });

      const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];

      const productData = await PRODUCTDATA.find({ isVisible: true, isActive: true});

      var errorMessage = req.flash("errorMessage");
      var successMessage = req.flash("successMessage");

      

      const userCart = await cart.find({ userId: userId });

      const userData = await User.findOne({ _id: userId });

      const walletBalance = userData.walletAmount;
      

      let totalPrice = 0;

      let totalQuantity = 0; 

      let discountedTotalPrice = 0; 

      let discountedPrices = []; 


      userCart.forEach(item => {

          let itemTotalPrice = item.price * item.quantity;

          totalPrice += itemTotalPrice;

          totalQuantity += item.quantity; 

          if ( CategoryOfferPrice.find(offer => offer.category === item.category)) {

              let discountedPrice = item.price - (categoryOffer * item.price / 100);

              discountedPrices.push(discountedPrice); 

              discountedTotalPrice += discountedPrice * item.quantity; 
              
          } else {
              discountedPrices.push(item.price); 
          }
      });
    
      
      const finalPrice = totalPrice - discountedTotalPrice;

      const products = await product.find(); 
      const addressData = await address.find({ userId: userId });
      const cartData = await cart.find();
      
      // Dummy
      const discontAfterPrice = 0;
      // Dummy
      


      res.render("checkOutPage", {  

        addressData, 
        userCart , 
        products,
        discontAfterPrice:discontAfterPrice,
        finalPrice:finalPrice, 
        totalPrice: totalPrice, 
        totalQuantity: totalQuantity,
        errorMessage:errorMessage, 
        successMessage:successMessage,
        discountedPrices: discountedPrices, 
        discountedTotalPrice: discountedTotalPrice,
        CategoryOfferPrice,
        walletBalance,
      });



    } catch (error) {
      console.log(error);
      res.render("pageNotFound404");
    }
  };
  




  exports.rezorPay = async (req, res) => {
    const { amount } = req.body;
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET});
    var options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    // Creating the order
    instance.orders.create(options, function (err, order) {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating order");
        return;
      }
     
      res.send({ orderId: order.id });
      // Replace razorpayOrderId and razorpayPaymentId with actual values
      // Redirect to /orderdata on successful payment
    });
  }


  exports.orderPlaced = async (req, res) => {
    try {
        const userId = req.session.user; 
        const userCart = await cart.find({ userId: userId });
       
        const orderDetails = await Order.find({userId}).sort({ _id: -1 }).limit(1);

        const totalPrice = orderDetails[0].totalPrice;
        const totalQuantity = orderDetails[0].totalQuantity;

        res.render("orderPlaced", { orderDetails , totalPrice , totalQuantity});
    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
}





exports.orderDetailsUser = async (req, res) => {
  try {
    const ITEMS_PER_PAGE = 4; 
    const userId = req.session.user; 
    const userData = await User.findOne({_id: userId});
    let page = parseInt(req.query.page) || 1;
    const totalOrders = await Order.countDocuments({ userId: userId });
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const orderData = await Order.find({ userId: userId }).skip(skip).limit(ITEMS_PER_PAGE);

    res.render("ordersUser", { orderData, userData, totalPages, currentPage: page });
  } catch (error) {
    console.log(error);
    res.render("pageNotFound404");
  }
}




exports.paymentSuccess = async (req, res) => {
  
    try {
      res.render("paymentSuccess");
      
    }catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
}



exports.resonForReturn = async (req,res)=>{

  try{

    const productId = req.query.productId
    const orderNumber = req.query.orderNumber
    res.render("resonForReturn",{productId,orderNumber});

  }catch(error){
    console.log(error);
    res.render("pageNotFound404");
  }

};



exports.downloadInvoice = async (req, res) => {
  try {
      const userId = req.session.user;

      // Find the latest order associated with the user ID
      const latestOrder = await Order.findOne({ userId }).sort({ orderDate: -1 });

      if (!latestOrder) {
          return res.status(404).send('No orders found for the user');
      }

      const { orderNumber, totalPrice, totalQuantity, address, products } = latestOrder;

      const doc = new PDFDocument();

      
      doc.font('Helvetica');

    
      doc.fontSize(24).fillColor('#008000').text('POLAR', { align: 'center', bold: true }).moveDown();

     
      doc.fontSize(18).text('Invoice', { align: 'center' }).moveDown();

      
      doc.fontSize(12).text(`Order ID: ${orderNumber}`).moveDown();
      doc.text(`Total Price: $${totalPrice.toFixed(2)}`).moveDown();
      doc.text(`Total Quantity: ${totalQuantity}`).moveDown();

    
      doc.moveDown().text('Shipping Address:', { underline: true });
      doc.text(`${address.name}`);
      doc.text(`${address.address}`);
      doc.text(`${address.locality}`);
      doc.text(`${address.state}, ${address.pincode}`);
      doc.moveDown();

     
      doc.moveDown().text('Products:', { underline: true });
      products.forEach((product, index) => {
          doc.text(`${index + 1}. ${product.productName}`);
          doc.text(`   - Quantity: ${product.quantity}`);
          doc.text(`   - Price: $${product.price.toFixed(2)}`);
          doc.moveDown();
      });

     
      res.setHeader('Content-disposition', 'attachment; filename="invoice.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      doc.pipe(res);
      doc.end();

  } catch (error) {
      console.error('Error downloading invoice:', error);
      res.render("pageNotFound404");
  }
};
  



exports.moreDetailsOrder = async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    console.log("orderNumber", orderNumber);
    const orderData = await Order.findOne({ _id: orderNumber });
    console.log("orderData", orderData);
    res.render("moreDetailsOrder", { orderData });

  }catch(error){
    console.log(error);
    res.render("pageNotFound404");
  }


};







/////////////////////////////////////////////////////////////////////////////








//Post Controller
/////////////////////////////////////////////////////////////////////////////

exports.postAddAddress = async (req, res) => {

  try {
      const submitedData = { 
          name: req.body.name,
          address: req.body.address,
          locality: req.body.locality,
          phone: req.body.phone,
          pincode: req.body.pincode,
          state: req.body.state,
      };

      if (!submitedData.name || !submitedData.address || !submitedData.locality || !submitedData.phone || !submitedData.pincode || !submitedData.state) {
        req.flash("errorMessage", "Please fill the form properly");
        return res.redirect("/checkout"); 
    }

    if (submitedData.name.length < 2) {
      req.flash("errorMessage", "Name must be at least 2 characters long");
      return res.redirect("/checkout");
  }
  
  if (!/^\d{10}$/.test(submitedData.phone)) {
      req.flash("errorMessage", "Phone number must be 10 digits long and only contain digits");
      return res.redirect("/checkout");
  }
  
  if (!/^\d{6}$/.test(submitedData.pincode)) {
      req.flash("errorMessage", "Enter a valid pincode");
      return res.redirect("/checkout");
  }
  
  

  if (!submitedData.name.trim() || !submitedData.address.trim() || !submitedData.locality.trim() || !submitedData.phone.trim() || !submitedData.pincode.trim() || !submitedData.state.trim()) {
    req.flash("errorMessage", "Cannot contain whitespace.");
    return res.redirect("/checkout"); 
}

const specialCharactersRegex = /[!@#$%^&*(),?":{}|<>`~]/;
if (specialCharactersRegex.test(submitedData.name)) {
    req.flash("errorMessage", "Name cannot contain special characters");
    return res.redirect("/checkout");
}

      const userId = req.session.user;

      
      const addData = await address.create({
          ...submitedData, 
          userId: userId 
      });

      req.flash("successMessage", "Address added successfully");
      return res.redirect("/checkout");
      
  } catch (error) {
      console.log(error);
      res.render("pageNotFound404");
  }
};




exports.postOrder = async (req, res) => {
  try {
     
      const userId = req.session.user;
      const userCart = await cart.find({ userId: userId });
      const productDataInCollection = await product.find();
      

      const submittedData = {
          userId: userId,
          paymentMethod: req.body.payment_type, 
          selectedAddress: req.body.selectedAddress,
          couponCode: req.body.couponCode,
      };  



      
      const fetchedAddressData = await address.findOne({ _id: submittedData.selectedAddress });
      
      const orderNumber = generateOrderNumber();

      const fectRefferalDataInSession = req.session.refferalPercentage;
      
      let refferalData;
      if(fectRefferalDataInSession){
         refferalData = fectRefferalDataInSession.refferalData;
      }

      if(fetchedAddressData){
        
      
        const CategoryOfferPrice = await offer.find({ isActive: true });
        const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
        const productData = await PRODUCTDATA.find({ isVisible: true, isActive: true});

        let totalPrice = 0;
        let totalQuantity = 0; 
        let discountedTotalPrice = 0; 
        let discountedPrices = [];
        let discountedPrice ;
        userCart.forEach(item => {
            let itemTotalPrice = item.price * item.quantity;
            totalPrice += itemTotalPrice;
            totalQuantity += item.quantity; 
            if ( CategoryOfferPrice.find(offer => offer.category === item.category)) {
                discountedPrice = item.price - (categoryOffer * item.price / 100);
                discountedPrices.push(discountedPrice); 
                totalPrice= discountedTotalPrice += discountedPrice * item.quantity; 
                
            } else {
                discountedPrices.push(item.price); 
            }
        });


        if( CategoryOfferPrice.find(offer => offer.category=="Sport") || CategoryOfferPrice.find(offer => offer.category=="Classic")){


          if (submittedData.paymentMethod === 'Wallet') {
        
            const user = await User.findOne({ _id: userId });
    
            if (totalPrice > user.walletAmount) {
              req.flash("errorMessage", "Insufficient Wallet Balance");
              return res.redirect("/checkout");
            }
          }

          const orderData = await Order.create({
            orderNumber: orderNumber,
            userId: submittedData.userId,
            products: userCart.map(item => {
                let discountedPrice = item.price; 
                const matchingProduct = productData.find(product => product.productName === item.productName);
                const matchingCategoryOffer = CategoryOfferPrice.find(offer => offer.category === item.category);
        
                if (matchingProduct || matchingCategoryOffer) {
                    discountedPrice = item.price - (categoryOffer * item.price / 100);
                }
        
                discountedPrices.push(discountedPrice);
        
                return {
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                    quantity: item.quantity,
                    price: discountedPrice,
                    status: 'Pending',
                    discountPrice: discountedPrice,
                    couponCode: req.body.couponCode,
                };
            }),
            totalQuantity: totalQuantity, 
            totalPrice: totalPrice, 
            address: {
                name: fetchedAddressData.name,
                address: fetchedAddressData.address,
                locality: fetchedAddressData.locality,
                phone: fetchedAddressData.phone,
                pincode: fetchedAddressData.pincode,
                state: fetchedAddressData.state
            },
            paymentMethod: submittedData.paymentMethod,
            orderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        });
        

        if (submittedData.paymentMethod === 'Wallet') {

          const user = await User.findOne({ _id: userId });

            const updatedWalletBalance = user.walletAmount - totalPrice;
            await User.updateOne({ _id: userId }, { $set: { walletAmount: updatedWalletBalance } });
          console.log('Wallet payment successful',updatedWalletBalance);
        } 
     

          
        }else{
          

 const orderData = await Order.create({
          orderNumber: orderNumber,
          userId: submittedData.userId,
          products: userCart.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
              status: 'Pending',
              couponCode: req.body.couponCode,
             
          })),
          totalQuantity: userCart.reduce((total, item) => total + item.quantity, 0), 
          totalPrice: userCart.reduce((total, item) => total + (item.quantity * item.price), 0), 
          address: {
              name: fetchedAddressData.name,  
              address: fetchedAddressData.address,
              locality: fetchedAddressData.locality,
              phone: fetchedAddressData.phone,
              pincode: fetchedAddressData.pincode,
              state: fetchedAddressData.state
          },
          paymentMethod: submittedData.paymentMethod,
          orderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      });


        }



      const fectRefferalDataInSession = req.session.refferalPercentage;
     
      
      if (fectRefferalDataInSession) {
        const refferalCodesInOffer = fectRefferalDataInSession.refferalCodesInOffer;
        const refferalData = fectRefferalDataInSession.refferalData;
       
        
        
        let refferalCode; 
        
        if (refferalData) {
            refferalCode = refferalData.refferalCode; 
        }
    
        let refferalAmount; 
        
        if (refferalCodesInOffer && refferalCodesInOffer.length > 0) {
            refferalAmount = refferalCodesInOffer[0].refferalAmound; 
           
        }
    
        if (refferalCode && refferalAmount) {
            const Userdata = await User.findOne({ refferalCode: refferalCode });
            const wallet = Userdata.walletAmount;
            const newWalletAmount = wallet + refferalAmount;
            const updateWallet = await User.updateOne(
                { _id: Userdata._id },
                { $set: { walletAmount: newWalletAmount } }
            );
        }
    } 
            

      const minusQuantityPromises = userCart.map(async (item) => {
        const productToUpdate = productDataInCollection.find(product => product._id.toString() === item.productId.toString());
        if (productToUpdate && productToUpdate.stockCount >= item.quantity) {
            await product.updateOne(
                { _id: item.productId },
                { $inc: { stockCount: -item.quantity } }
            );
        } else {
            throw new Error(`Insufficient stock for product ${item.productId}`);
        }
    });
    await Promise.all(minusQuantityPromises);
    



      const deletedData = await cart.deleteMany({ userId: userId });
     res.redirect("/paymentSuccess")
    }
  } catch (error) {
      console.log(error);
      res.render("pageNotFound404");
  }
}



exports.postOrder2ForRazorPay = async (req,res) => {
  
  try {

      const userId = req.session.user;
      const userCart = await cart.find({ userId: userId });
      const productDataInCollection = await product.find();
      const { razorpay_payment_id, address ,orderprice} = req.body;
      

      const submittedData = {
          userId: userId,
          paymentMethod: "RazorPay",
          selectedAddress: address
      };


      const fetchedAddressData = await Address.findOne({ _id: address });

      const orderNumber = generateOrderNumber();

      if(fetchedAddressData){
        
      
        const CategoryOfferPrice = await offer.find({ isActive: true });
        const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
        const productData = await PRODUCTDATA.find({ isVisible: true, isActive: true});

        let totalPrice = 0;
        let totalQuantity = 0; 
        let discountedTotalPrice = 0; 
        let discountedPrices = [];
        let discountedPrice ;
        userCart.forEach(item => {
            let itemTotalPrice = item.price * item.quantity;
            totalPrice += itemTotalPrice;
            totalQuantity += item.quantity; 
            if (productData.find(product => product.productName === item.productName) || CategoryOfferPrice.find(offer => offer.category === item.category)) {
                discountedPrice = item.price - (categoryOffer * item.price / 100);
                discountedPrices.push(discountedPrice); 
                totalPrice= discountedTotalPrice += discountedPrice * item.quantity; 
                
            } else {
                discountedPrices.push(item.price); 
            }
        });


        if( CategoryOfferPrice.find(offer => offer.category=="Sport") || CategoryOfferPrice.find(offer => offer.category=="Classic")){


          const orderData = await Order.create({
            orderNumber: orderNumber,
            userId: submittedData.userId,
            products: userCart.map(item => {
                let discountedPrice = item.price; 
                const matchingProduct = productData.find(product => product.productName === item.productName);
                const matchingCategoryOffer = CategoryOfferPrice.find(offer => offer.category === item.category);
        
                if (matchingProduct || matchingCategoryOffer) {
                    discountedPrice = item.price - (categoryOffer * item.price / 100);
                }
        
                discountedPrices.push(discountedPrice);
        
                return {
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                    quantity: item.quantity,
                    price: discountedPrice,
                    status: 'Pending',
                    discountPrice: discountedPrice,
                    couponCode: req.body.couponCode,
                };
            }),
            totalQuantity: totalQuantity, 
            totalPrice: orderprice, 
            address: {
                name: fetchedAddressData.name,
                address: fetchedAddressData.address,
                locality: fetchedAddressData.locality,
                phone: fetchedAddressData.phone,
                pincode: fetchedAddressData.pincode,
                state: fetchedAddressData.state
            },
            paymentMethod: submittedData.paymentMethod,
            orderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        });
        
     

          
        }else{
          

 const orderData = await Order.create({
          orderNumber: orderNumber,
          userId: submittedData.userId,
          products: userCart.map(item => ({
              productId: item.productId,
              productName: item.productName,
              productImage: item.productImage,
              quantity: item.quantity,
              price: item.price,
              status: 'Pending',
              couponCode: req.body.couponCode,
             
          })),
          totalQuantity: userCart.reduce((total, item) => total + item.quantity, 0), 
          totalPrice:orderprice, 
          address: {
              name: fetchedAddressData.name,  
              address: fetchedAddressData.address,
              locality: fetchedAddressData.locality,
              phone: fetchedAddressData.phone,
              pincode: fetchedAddressData.pincode,
              state: fetchedAddressData.state
          },
          paymentMethod: submittedData.paymentMethod,
          orderDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
      });


        }


        const minusQuantityPromises = userCart.map(async (item) => {
        const productToUpdate = productDataInCollection.find(product => product._id.toString() === item.productId.toString());
        if (productToUpdate && productToUpdate.stockCount >= item.quantity) {
            await product.updateOne(
                { _id: item.productId },
                { $inc: { stockCount: -item.quantity } }
            );
        } else {
            throw new Error(`Insufficient stock for product ${item.productId}`);
        }
    });
    await Promise.all(minusQuantityPromises);
      
        const deletedData = await cart.deleteMany({ userId: userId });
       res.redirect("/paymentSuccess")
      }

  } catch (error) {
    console.log(error);
    res.render("pageNotFound404");
  }
};







  


  exports.returnOrder = async (req, res) => {
    try {
      const productId = req.params.productId;
      const orderNumber = req.params.orderNumber;
      let reasons = req.body.reason  || ['No reason provided']; 
      const userId = req.session.user;
     

      // Convert array of reasons to a single string
      const reasonString = reasons.join(', ');
  
      const updateStatus = await Order.updateOne(
        { 
          orderNumber: orderNumber,
          userId: userId,
          "products.productId": productId  
        },
        { 
          $set: { 
            "products.$.status": "Returned",
            "products.$.reason": reasonString
          } 
        }
      );
  
      res.redirect("/orderDetailsUser");
    } catch (error) {
      console.log(error);
      res.render("pageNotFound404");
    }
  }
  
  


  exports.postCancel = async (req, res) => {
    try {
  
      const productId = req.params.productId;
      const OrderNumber = req.params.orderNumber;
      const cancelReason = req.body.reason || 'No reason provided';
      const userId = req.session.user;
      
     
  
      const OrderData = await Order.findOne({ orderNumber: OrderNumber, userId: userId , "products.productId": productId});
      
  
      // Step 1: Update order status to "Cancelled"
      const ChangeStatus = await Order.updateOne(
        { 
          orderNumber: OrderNumber,
          userId: userId,
          "products.productId": productId  
        },
        { 
          $set: { "products.$.status": "Cancelled" } 
        }
      );
  
     
      const order = await Order.findOne({ orderNumber: OrderNumber, userId: userId });
      const cancelledProduct = order.products.find(product => product.productId.toString() === productId);
  
      // Step 3: Increase stock count
      const productStockBackToOriginal = await product.updateOne(
        { _id: productId },
        { $inc: { stockCount: cancelledProduct.quantity } }
      );
  
      // step 4: add cancelled product amount to wallet
     const Userdata = await User.findOne({ _id: userId });
     console.log("Userdata", Userdata)
     const wallet = Userdata.walletAmount;
     console.log("wallet", wallet)
     const amount = cancelledProduct.price;
     console.log("amount", amount)
     const newWalletAmount = wallet + amount;
     console.log("newWalletAmount", newWalletAmount)
     
    //  await User.updateOne(
    //    { _id: userId },
    //    { $set: { walletAmount: newWalletAmount } }
     
    //  )
     await User.findByIdAndUpdate(userId, { walletAmount: newWalletAmount });

     const newTransaction = new Wallet({
      user: userId,
      type: 'refund',
      amount: amount,
      timestamp: Date.now()
  });

  await newTransaction.save();
  
      res.redirect("/orderDetailsUser");
    } catch (error) {
      console.log(error);
      res.render("pageNotFound404");
    }
  };
  





///////////////////////////////////////////////////////////////////////////////