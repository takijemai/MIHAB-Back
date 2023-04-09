const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');
const Token = require('../models/token');

module.exports = {
  VerifyToken: async (req, res, next) => {
   //let token = req.cookies.auth 
   //console.log( req.params.id);
   try {
    
    const tokenData = await Token.findOne({ userId: req.params.id }); 
    //console.log(tokenData);
    if (tokenData) {
      const token = tokenData.token;
      
      const data = jwt.verify(token, dbConfig.secret);
      req.user = data;
      req.username = data.username;
      next();
    } else {
      return res.status(HttpStatus.StatusCodes.FORBIDDEN).json({ message: 'No token provided' });
    }
  } catch (err) {
    return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to authenticate token' });
  }

  }
}