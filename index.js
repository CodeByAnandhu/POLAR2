require('dotenv').config(); 
const express = require("express");
const app = express();
const PORT = 3000 || process.env.PORT; 

const bodyParser = require("body-parser"); 
const session = require('express-session');
const flash = require("connect-flash");

app.use(flash());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + "/public"));

app.set("view engine", "ejs");

app.set("views", ["./views/user", "./views/admin"]);

app.use('/uploads',express.static(__dirname+"/uploads"));

//Routers Connection
//User 
const userConnection = require("./routes/user");
app.use("/", userConnection);

//Admin
const adminConnection = require("./routes/admin");
app.use("/", adminConnection);

//Category
const categoryConnection = require("./routes/category");
app.use("/",categoryConnection);

//Product
const productConnection = require("./routes/product");
app.use("/",productConnection);

const cartConnection = require("./routes/cart");
app.use("/",cartConnection);

const shopConnect = require("./routes/shop");
app.use("/",shopConnect);

const profileConnect = require("./routes/profile");
app.use("/",profileConnect);

const checkOutConnect = require("./routes/checkOut");
app.use("/",checkOutConnect);

const orderDetailsConnect = require("./routes/orderDetailsAdmin");
app.use("/",orderDetailsConnect);

const couponConncet = require("./routes/offer-coupon");
app.use("/",couponConncet);

////////////////////////////////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
