const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');
const Token = require('../models/token');

module.exports = {
  VerifyToken: async (req, res, next) => {
   //let token = req.cookies.auth 
   try {
    const tokenData = await Token.findOne({ token: req.user.token }); 
    console.log(tokenData);
    if (tokenData) {
      const token = tokenData.token;
      console.log(token);
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