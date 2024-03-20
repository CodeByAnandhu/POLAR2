const express = require("express");
const router = express();
const User = require("../model/userModel");
const mongoose = require("../config/dbConnect");
const nodemailer = require("nodemailer");
// const bcrypt = require("bcryptjs");
const otp = require("../model/otpModel");
const AddProduct = require("../model/addProductModel");
const { render } = require("ejs");
const refferalCode = require("../middleware/refferalCodeGenerator");




//get controll
//////////////////////////////////////////////////////////////

exports.getLogin = (req, res) => {
  res.render("userlogin");
};


exports.getRegister = (req, res) => {
  res.render("userRegister");
};


exports.getOtp = (req, res) => {
  res.render("otp");
};


exports.getLogout = (req,res) =>{

  req.session.destroy((err)=>{
 
    if(err){

      console.error("Error destroying session:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }else{

      res.redirect("/login"); 
    }

  })
}


exports.getForgetPassword = async(req, res) => {

  try {
    // const user = await User.findOne({ email: req.session.signupData.email });
    // if (!user) {
    //   return res.render("forgetPassword", { message: "User not found" });
    // }
     res.render("forgetPassword");

  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
 

};


exports.getVerifyEmailCode = async(req, res) => {
  
  try {
    // const user = await User.findOne({ email: req.session.signupData.email });
    // if (!user) {
    //   return res.render("forgetPassword", { message: "User not found" });
    // }
    res.render("forgetPasswordVerify");
    
  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}


exports.getResetPassword = async(req, res) => {
  
  try {
    
    res.render("resetPassword");
    
  }catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

//////////////////////////////////////////////////////////////








// Post Controll
////////////////////////////////////////////////////////////////
exports.postLogin = async (req, res) => {
  const data = {
    email: req.body.email,
    password: req.body.password,
    // confirmPassword: req.body.confirmPassword,
  };


  try {
    const user = await User.findOne({
      email: data.email,
      password: data.password,
    });
   
  
    if (user && user.isBlocked === true) {
     return res.render("userlogin", { message: "We're sorry, but your account has been blocked." });
    }
  
    if (!user) {
      res.render("userlogin", { message: "User Not Exists" });
    } else {
       req.session.user = user._id
       res.redirect("/getHome");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
  
};



exports.postRegister = async (req, res) => {

  try {

      const { name, email, password, confirmPassword } = req.body;


      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(email)) {

        return res.render("userRegister", { message: "Please enter a valid email address" });

      }
      
      const hasWhiteSpace = (value) => { 
        return /\s/.test(value);
      };

    
      const isValidInput = name && !/^\d+$/.test(name);

      
      if (!name.trim()) {
        return res.render("userRegister", { message: "Please fill the name field" });
      }
      
    
      if (!isValidInput) {
        return res.render("userRegister", { message: "Cannot contain numeric values in names" });
      }
      


      if (hasWhiteSpace(email) || hasWhiteSpace(password) || hasWhiteSpace(confirmPassword)) {
        return res.render("userRegister", { message: "Input fields cannot contain white space" });
      }

      const specialCharacter = name && /^[^\d`~!@#$%^&*()_+={}\[\]|\\;:'",<>\/?]*$/.test(name);

      if (!specialCharacter) {
        return res.render("userRegister", { message: "Name cannot contain special characters" });
      }

      
    
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.render("userRegister", { message: "User Already exists" });
        }

        const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

        req.session.signupData = {
          name,
          email,
          password,
          confirmPassword,
        };

        const newOTP = new otp({
          email,
          otp: generatedOTP,
        });
        await newOTP.save();

        const mailBody = `Your OTP for registration is ${generatedOTP}`;
        await mailSender(email, "Registration OTP", mailBody);

        res.redirect("/getOtp");
      } catch (error) {
        console.error(error);
      }


};


const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "anandhuajigopinath@gmail.com",
        pass: "xrqw rlhh pafh xpce ",
      },
    });

    let info = await transporter.sendMail({
      from: "www.anandhuajigopinath.com",
      to: `${email}`,
      subject: `${title}`,
      html: ` ${body}`,
    });

  
    return info;
  } catch (error) {
    console.log(error.message);
  }
};

exports.postOtp = async (req, res) => {
  try {
    const { n1, n2, n3, n4 } = req.body;

    // Validate input: Check for presence, numeric values, and no white spaces
    const isValidInput = n1 && n2 && n3 && n4 && /^\d+$/.test(n1 + n2 + n3 + n4);

    if (!isValidInput) {
      return res.render("otp",{message:"Only numeric values, and no white spaces"})
    }

    const otpData = `${n1}${n2}${n3}${n4}`;
   

    const signupData = req.session.signupData;

    if (!signupData) {
      return res.render("otp",{message:"User data not found. Please sign up again."})
    }

    const otpRecord = await otp.findOne({ email: signupData.email });

    if (!otpRecord) {
      return res.render("otp",{message:"OTP not found. Please request a new one."})

    }
    

    const refferalCodeGenerate = refferalCode(8);
    if (otpData === otpRecord.otp) {
      const newUser = new User({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        refferalCode : refferalCodeGenerate,
      });

      await newUser.save();

      delete req.session.signupData;

      res.redirect("/login");
    } else {
      return res.render("otp",{message:"Incorrect OTP. Please try again."})
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// Define route for resending OTP
exports.resendotp = async (req,res)=>{
    
  try {
      const userEmail = req.session.signupData.email; 
          
      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
      const newOTP = new otp({
          email: userEmail,
          otp: generatedOTP,
      });
      await newOTP.save();
  
      const mailBody = `Your OTP for registration is ${generatedOTP}`;
      await mailSender(userEmail, 'Registration OTP', mailBody);
      res.redirect('/resendotp')
  
      res.json({ success: 'OTP Resent successfully' });
  } catch (error) {
      console.error('Error:', error);
    
    }
};


exports.postLogout = (req, res) => {
  try {
      req.session.user = null; 
      req.session.save((err) => { 
          if (err) {
              console.error("Error destroying session:", err);
              res.status(500).json({ error: "Internal Server Error" });
          } else {
              res.redirect("/login");
          }
      });
  } catch (err) {
      console.log(err);
  }
};





exports.postForgetPassword = async (req, res) => {

  const { email} = req.body;
  
  const UserData = await User.findOne({email});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.render("forgetPassword", { message: "Invalid Email" });
  }
  

  if(!UserData){
    return res.render("forgetPassword", { message: "User Not Exists" });
  }

  const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

  req.session.signupData = {
    email
  };

  const newOTP = new otp({
    email,
    otp: generatedOTP,
  });
  await newOTP.save();

  const mailBody = `Your Reset Password Code is ${generatedOTP}`;
  await mailSender(email, "Registration OTP", mailBody);
  
  res.redirect("/verifyEmailCode");
  
}


exports.postVerificationCode = async (req, res) => {

 try{

  const { n1, n2, n3, n4 } = req.body;

  // Validate input: Check for presence, numeric values, and no white spaces
  const isValidInput = n1 && n2 && n3 && n4 && /^\d+$/.test(n1 + n2 + n3 + n4);

  if (!isValidInput) {
    return res.render("forgetPasswordVerify",{message:"Only numeric values, and no white spaces"});
  }

  const otpData = `${n1}${n2}${n3}${n4}`;
 

  const signupData = req.session.signupData;

  if (!signupData) {
    return res.render("forgetPasswordVerify",{message:"User data not found. Please sign up again."});
  }

  const otpRecord = await otp.findOne({ email: signupData.email });

  if (!otpRecord) {
    return res.render("forgetPasswordVerify",{message:"OTP not found. Please request a new one."});

  }

  

  if (otpData === otpRecord.otp) { 

    res.redirect("/resetPassword");
    
  } else {
    return res.render("forgetPasswordVerify",{message:"Incorrect OTP. Please try again."});
  }

 }catch(error){
   console.error("Error:", error);
   res.status(500).json({ error: "Internal Server Error" });
 }

}



exports.postResetPassword = async (req, res) => {

  const { password} = req.body;
  
  const passwordRegex = /^\d+$/;

  if (!passwordRegex.test(password)) {
    return res.render("resetPassword", { message: "Invalid password format" });
  }

  const signupData = req.session.signupData;
  const UserData = await User.updateOne({email: signupData.email},{$set:{password:password}});
  res.redirect("/login");
  
}
////////////////////////////////////////////////////////////////
