const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');
const Token = require('../models/token');

module.exports = {
  VerifyToken: async (req, res, next) => {
    let token = req.cookies.auth;
  
    // If token is not found in cookies, retrieve it from user object or other source
    if (!token) {
      // Assuming the token is stored in the user object as user.token
      token = req.user.token;
      // If token is still not found, return error
      if (!token) {
        return res.status(HttpStatus.StatusCodes.FORBIDDEN).json({ message: 'No token provided' });
      }
    }
  
    try {
      const tokenData = await Token.findOne({ token: token }); 
      if (tokenData) {
        const data = jwt.verify(tokenData.token, dbConfig.secret);
        req.user = data;
        req.username = data.username;
        next();
      } else {
        return res.status(HttpStatus.StatusCodes.FORBIDDEN).json({ message: 'No token found' });
      }
    } catch (err) {
      return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving token from database' });
    }
  }
  
  
};