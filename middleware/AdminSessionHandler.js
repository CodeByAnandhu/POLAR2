const ADMINDATA = require("../model/adminModel");



async function  checkAdminSession(req, res, next) {
 

    const Auth = await ADMINDATA.find({_id:req.session.Admin});

      if (req.session.Admin) {

    next();

  } else {

    res.redirect("/adminLogin");

  }
  
}

module.exports = checkAdminSession;

