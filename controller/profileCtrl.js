const express = require("express");
const router = express();
const Address = require("../model/addressModel");
const User = require("../model/userModel");
const Razorpay = require("razorpay");
const flash = require("connect-flash");
const Coupon = require("../model/couponModel");
const Cart = require("../model/cartModel");
const product = require("../model/addProductModel");
const Order = require("../model/orderModel");
const discount = require("../model/offerModel");
const wallet = require("../model/walletTransactions");
const offer = require("../model/offerModel"); 
const refferal = require("../model/refferalModel");



//Get Controller
///////////////////////////////////////////////////////////////////////
exports.getProfile = async (req, res) => {
    try {

        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        const Addressdata = await Address.find({ userId: userId });
        const AddressFirstIndex = Addressdata[0];
        var errorMessage = req.flash("errorMessage");
        var successMessage = req.flash("successMessage");
        const walletData = await wallet.find({ user: userId });
        res.render("profile", { userData, errorMessage: errorMessage, successMessage: successMessage, AddressFirstIndex , walletData });

    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }

}

exports.getProfileEdit = async (req, res) => {

    try {
        const userId = req.session.user;
        var errorMessage = req.flash("errorMessage");
        var successMessage = req.flash("successMessage");
        const userData = await User.findOne({ _id: userId });
        res.render("ProfileEdit", { userData ,errorMessage: errorMessage , successMessage: successMessage });
    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
}


exports.getAddress = async (req, res) => {

    try {

        const userId = req.session.user;
        const errorMessage = req.flash("errorMessage");
        const successMessage = req.flash("successMessage");
        const userData = await User.findOne({ _id: userId });
        const AddressData = await Address.find({ userId: userId });
        res.render("address", { AddressData, userData, errorMessage: errorMessage, successMessage: successMessage });


    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }


};



exports.getEditAddress = async (req, res) => {

    const id = req.params.id;
    const userId = req.session.user;
    const errorMessage = req.flash("errorMessage");
    const successMessage = req.flash("successMessage");
    const userData = await User.findOne({ _id: userId });
    const addressData = await Address.findById(id);
    res.render("editAddress", { addressData , userData , errorMessage: errorMessage , successMessage: successMessage});

}

exports.getAddAddress = async (req, res) => {

    try{

    const userId = req.session.user;
    const errorMessage = req.flash("errorMessage");
    const successMessage = req.flash("successMessage");
    const userData = await User.findOne({ _id: userId });
    res.render("addNewAddress",{userData,errorMessage: errorMessage , successMessage: successMessage});

    }catch(error){

        console.log(error);
    }

}



exports.getCouponsUser = async (req, res) => {

    try {

        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        const CouponsData = await Coupon.find();

        res.render("couponUser", { CouponsData ,userData});

    } catch (error) {

        console.log(error);
        res.render("pageNotFound404");
    }

};


///////////////////////////////////////////////////////////////////////







//Post Controller
///////////////////////////////////////////////////////////////////////


exports.postEditProfile = async (req, res) => {
    try {
        const userId = req.session.user;
        const existingUser = await User.findById(userId);


        if (!existingUser) {
            return res.render("ProfileEdit", { message: "User not found" });
        }

        const data = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        };


        const isValidInput =  /^[^\d`~!-@#$%^&*()_+={}\[\]|\\;:'",.<>\/?]*$/;

        if (!isValidInput.test(data.name)){

            req.flash("errorMessage", "Name cannot contain special characters");
            return res.redirect("/editProfile");

        }




        let profileImage = [];

        if (req.files && req.files.length > 0) {
            const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);
            profileImage = fileUrls;
        }

        const storeUserData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            profileImage: profileImage,
        };

        // const emailInUse = await User.findOne({ email: data.email });
        // if (emailInUse && emailInUse._id.toString() !== userId) {
        //     return res.render("ProfileEdit", { message: "Email already in use" });
        // }

        // if (existingUser.email !== data.email || existingUser.password !== data.password) {
        await User.findByIdAndUpdate(userId, storeUserData);
        res.redirect("/profile");
        // } else {
        //     // No changes in email or password
        //     res.render("ProfileEdit", { message: "Email and password remain unchanged" });
        // }
    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
};






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
       

        
        if (isNaN(submitedData.pincode) || isNaN(submitedData.phone)) {

            req.flash("errorMessage", "Please enter valid pincode and phone number");
            return res.redirect("/addAddress");
           
        }

        if (!/^\d{6}$/.test(submitedData.pincode)) {
            req.flash("errorMessage", "Enter a valid pincode");
            return res.redirect("/addAddress");
        }

        if(submitedData.phone.length !== 10){

            req.flash("errorMessage", "Please enter valid phone number");
            return res.redirect("/addAddress");

        }

        if (!/^\d{10}$/.test(submitedData.phone)) {
            req.flash("errorMessage", "Phone number must be 10 digits long and only contain digits");
            return res.redirect("/addAddress");
        }

        const isValidInput = /^[^\d`~!@#$%^&*()_+={}\[\]|\\;:'",<>\/?]*$/;

        if (!isValidInput.test(submitedData.name)){

            req.flash("errorMessage", "Name cannot contain special characters");
            return res.redirect("/addAddress");
        }
        if (submitedData.name.length < 2) {
            req.flash("errorMessage", "Name must be at least 2 characters long");
            return res.redirect("/addAddress");
        }

        const userId = req.session.user;

        const addData = await Address.create({
            ...submitedData,
            userId: userId
        });

        req.flash("successMessage", "Address added successfully");
        res.redirect("/address");

    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
};



exports.updateAddress = async (req, res) => {

    try {
        const id = req.params.id;
        const submitedData = {
            name: req.body.name,
            address: req.body.address,
            locality: req.body.locality,
            phone: req.body.phone,
            pincode: req.body.pincode,
            state: req.body.state,
        };



        if (isNaN(submitedData.pincode) || isNaN(submitedData.phone)) {

            req.flash("errorMessage", "Please enter valid pincode and phone number");
            return res.redirect(`/editAddress/${id}`);
           
        }

        if(submitedData.phone.length !== 10){

            req.flash("errorMessage", "Please enter valid phone number");
            return res.redirect(`/editAddress/${id}`);

        }

        const isValidInput = /^[^\d`~!@#$%^&*()_+={}\[\]|\\;:'",<>\/?]*$/;

        if (!isValidInput.test(submitedData.name)){

            req.flash("errorMessage", "Name cannot contain special characters");
            return res.redirect(`/editAddress/${id}`);
        }

        if(submitedData.name.length < 2){
            req.flash("errorMessage", "Name must be at least 2 characters long");
            return res.redirect(`/editAddress/${id}`);
        }

        const updateData = await Address.findByIdAndUpdate(id, submitedData);

        req.flash("successMessage", "Address updated successfully");
        res.redirect("/address");
    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
}



exports.deleteAddress = async (req, res) => {

    try {
        const id = req.params.id;
        const deleteData = await Address.findByIdAndDelete(id);
        res.redirect("/address?message=Address deleted successfully");
    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
}




exports.getRazerPay = async (req, res) => {
    const { amount } = req.body;
    var instance = new Razorpay({ key_id: process.env.KEY_ID, key_secret: process.env.KEY_SECRET });
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




exports.walletTopUp = async (req, res) => {
    try {

        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });
        const walletAmountToAdd = parseFloat(req.body.amount);
        if (!userData) {

            req.flash("errorMessage", "User not found");
            return res.redirect("/profile");
        }
        

        const newTransaction = new wallet({
            user: userId,
            type: 'deposit',
            amount: walletAmountToAdd,
            timestamp: Date.now()
        });

        
        await newTransaction.save();

        const transactionId = req.body.razorpay_payment_id;

        const walletAmount = userData.walletAmount;

        const updatedWalletAmount = walletAmount + walletAmountToAdd;

        await User.findByIdAndUpdate(userId, { walletAmount: updatedWalletAmount });
        
        req.flash("successMessage", "Amount added to wallet successfully");
        res.redirect('/profile');

        if (isNaN(walletAmountToAdd)) {
            return res.status(400).json({ error: 'Invalid wallet amount' });
        }

       
      
       


     

    } catch (error) {
        console.log(error);
        res.render("pageNotFound404");
    }
};

// Webhook handler for Razorpay payment confirmation
exports.razorpayWebhook = async (req, res) => {
    const body = req.body;
    const signature = req.headers['x-razorpay-signature'];

    const isValidSignature = razorpay.validateWebhookSignature(JSON.stringify(body), signature);

    if (isValidSignature) {
        // Payment successful, update user's wallet amount
        const orderId = body.payload.payment.entity.order_id;
        const amount = body.payload.payment.entity.amount / 100; // Convert back to rupees
        // Update user's wallet amount here
        res.status(200).send('Payment success');
    } else {
        // Invalid signature, handle accordingly
        res.status(400).send('Invalid signature');
    }
};






exports.withdrawalAmount = async (req, res) => {
    try {
        const userId = req.session.user;
        const userData = await User.findOne({ _id: userId });

        if (!userData) {
            req.flash("errorMessage", 'User not found');
            return res.redirect(`/profile`);
        }

        const withdrawalAmount = Number(req.body.withdrawalAmount);

        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            req.flash("errorMessage", 'Invalid withdrawal amount');
            return res.redirect(`/profile`);
        }

        if (withdrawalAmount > userData.walletAmount) {
            req.flash("errorMessage", 'Insufficient balance');
            return res.redirect(`/profile`);
        }


        const newTransaction = new wallet({
            user: userId,
            type: 'withdrawal',
            amount: withdrawalAmount,
            timestamp: Date.now()
        });
        
        await newTransaction.save();

        const updatedUserData = await User.findByIdAndUpdate(userId, {
            walletAmount: userData.walletAmount - withdrawalAmount
        });

        req.flash("successMessage", 'Withdrawal successful');
        res.redirect("/profile");

    } catch (error) {
        console.log(error);
        req.flash("errorMessage", 'An error occurred');
        res.redirect(`/profile`);
    }
}

exports.postCouponApply = async (req, res) => {
    try {

        const usersId = req.session.user; 
        //
        const CategoryOfferPrice = await offer.find({ isActive: true });
        const categoryOffer = CategoryOfferPrice.map((item) => item.discount)[0];
        //
        const walletBalance  = await User.findOne({ _id: req.session.user });
        var errorMessage = req.flash("errorMessage");
        var successMessage = req.flash("successMessage");
        const products = await product.find();
        const addressData = await Address.find();
        const couponCode = req.body.couponCode;
        const cartDatas = await Cart.find({ userId: req.session.user });


        if (!cartDatas || cartDatas.length === 0) {
            req.flash("errorMessage", 'No items in the cart');
            return res.redirect("/checkout");
        }

        let cartTotalPrice = 0;
        cartDatas.forEach(item => {
            cartTotalPrice += item.price * item.quantity;
        });


        const couponsData = await Coupon.findOne({ couponCode: couponCode });
      
        
        if (couponsData) {
            const existingCouponOrders = await Order.findOne(
                { userId: usersId, "products.couponCode": couponsData.couponCode },
                { "products.couponCode": 1, _id: 0 }
            );            
          
            if (existingCouponOrders && existingCouponOrders.products && existingCouponOrders.products[0].couponCode === couponsData.couponCode) {
                req.flash("errorMessage", 'Coupon already used');
                return res.redirect("/checkout");
            }

            if(couponsData.expiryDate < Date.now()){
                req.flash("errorMessage", 'Coupon expired');
                return res.redirect("/checkout");
            }

            if(couponsData.purchaseAmount < cartTotalPrice){
                req.flash("errorMessage", 'Maximum purchase amount reached');
                return res.redirect("/checkout");
            }
            let mimimumpurchaseAmount = couponsData.minimumPurchaseAmount;
            if(couponsData.minimumPurchaseAmount > cartTotalPrice){
                req.flash("errorMessage", `Minimum purchase amount ₹ ${mimimumpurchaseAmount}`);
                return res.redirect("/checkout");
            }
        
        

            const PercentageOfCoupon = couponsData.discount;
            const userId = req.session.user;
            const userCart = await Cart.find({ userId: userId });
            
            let finalPrice = 0;
            let totalPrice = 0;
            let totalQuantity = 0;
            userCart.forEach(item => {
                totalPrice += item.price * item.quantity;
                totalQuantity += item.quantity;
            });

            

            let discountedPrices = [];
            userCart.forEach(item => {

                let itemTotalPrice = item.price * item.quantity;

                totalPrice += itemTotalPrice;

                totalQuantity += item.quantity; 

                if ( CategoryOfferPrice.find(offer => offer.category === item.category)) {

                    let discountedPrice = item.price - (categoryOffer * item.price / 100);

                    discountedPrices.push(discountedPrice); 
                  
                    
                } else {
                    discountedPrices.push(item.price); 
                }
            });


            const totalDiscount = (cartTotalPrice * PercentageOfCoupon) / 100;

            const discontAfterPrice = cartTotalPrice - totalDiscount;
            const cartData = await Cart.find();
            // req.flash("successMessage", 'Coupon applied successfully');
            

            res.render("checkOutPage", { 
   
                discontAfterPrice: discontAfterPrice, 
                cartData, 
                userCart, 
                addressData, 
                products, 
                totalQuantity, 
                totalPrice: totalPrice, 
                errorMessage: errorMessage, 
                successMessage: successMessage, 
                couponCode, 
                CategoryOfferPrice,
                discountedPrices,
                walletBalance,
                finalPrice:finalPrice,
            })




            ///          Check referal code        ///
        } else if (!couponsData) {

            const referalCode = req.body.couponCode
            const UserSessionId = req.session.user
            const userCollectionFind = await User.find({ _id: UserSessionId })

            //If user try to apply user own refferal code in this block that
            if (userCollectionFind[0].refferalCode === referalCode) {
                req.flash("errorMessage", 'You cant use your own refferal code');
                return res.redirect("/checkout");
            }
           


            const refferalData = await User.findOne({ refferalCode: referalCode });
           

            if (!refferalData) {
                req.flash("errorMessage", 'Invalid Coupon Code');
                return res.redirect("/checkout");
            }


            
            const existingCouponOrders = await Order.findOne({
                userId: UserSessionId,
                "products.couponCode": refferalData.refferalCode
              });
             
            if (existingCouponOrders) {

                req.flash("errorMessage", 'Coupon already used');
                return res.redirect("/checkout");
            }



            const refferalCodesInOffer = await refferal.find();
            
           
            const firstReferralDiscount = refferalCodesInOffer[0];
            const PercentageOfCoupon = firstReferralDiscount.percentage;
            

            const userId = req.session.user;
            const userCart = await Cart.find({ userId: userId });
            let finalPrice = 0;
            let totalPrice = 0;
            let totalQuantity = 0;
            let discountedPrices = [];
            userCart.forEach(item => {

                let itemTotalPrice = item.price * item.quantity;

                totalPrice += itemTotalPrice;

                totalQuantity += item.quantity; 

                if ( CategoryOfferPrice.find(offer => offer.category === item.category)) {

                    let discountedPrice = item.price - (categoryOffer * item.price / 100);

                    discountedPrices.push(discountedPrice); 
                  
                    
                } else {
                    discountedPrices.push(item.price); 
                }
            });

            const totalDiscount = (cartTotalPrice * PercentageOfCoupon) / 100;

            const discontAfterPrice = cartTotalPrice - totalDiscount;
           
            // req.flash("successMessage", 'Coupon applied successfully');
            const cartData = await Cart.find();
        

            const combinedData = {
                refferalCodesInOffer: refferalCodesInOffer,
                refferalData: refferalData
              };
            
              
            
             req.session.refferalPercentage = combinedData;
             
            
            res.render("checkOutPage", { 

                discontAfterPrice: discontAfterPrice, 
                cartData,userCart, addressData, 
                products, totalQuantity, 
                totalPrice: totalPrice, 
                errorMessage: errorMessage, 
                successMessage: successMessage, 
                couponCode,
                CategoryOfferPrice,
                discountedPrices, 
                walletBalance,
                finalPrice:finalPrice,
            
            })


        }

    } catch (err) {
        console.log(err);
        req.flash("errorMessage", 'Internal server error');
        res.redirect("/checkout");
    }
};




exports.cancelCoupon = async (req, res) => {
    try {

        if (req.session.refferalPercentage) {
            delete req.session.refferalPercentage;
        }
        
        req.flash("successMessage", 'Coupon cancelled successfully');
        
        res.redirect("/checkout");

      
     

    } catch (err) {
        console.log(err);
        req.flash("errorMessage", 'Failed to cancel coupon');
        res.redirect("/checkout");
    }
};



///////////////////////////////////////////////////////////////////////////////////