const USERDATA = require("../model/userModel");



async function  checkUserSession(req, res, next) {
 

    const Auth = await USERDATA.find({_id:req.session.user});

      if ( req.session.user && Auth[0].isBlocked==false) {

    next();

  } else {

    res.redirect("/login");

  }
  
}

module.exports = checkUserSession;

