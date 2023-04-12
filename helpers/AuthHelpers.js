const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');
const Token = require('../models/token');

module.exports = {
  VerifyToken: async (req, res, next) => {
    try {

      const token = req.cookies.auth || req.headers.authorization.split(' ')[1];


      // Check if token exists in database
      // const tokenData = await Token.findOne({ token: token });
  
      // if (tokenData) {
      //   token = tokenData.token;
      // } else {
      //   // If token not found in dabtabse, we check req.cookies.auth
      //   token = req.cookies.auth;
      // }
  
      if (!token) {
        // If token is still not found, return forbidden status
        return res
          .status(HttpStatus.StatusCodes.FORBIDDEN)
          .json({ message: 'No token provided' });
        
      } else {
        // Verify the token and set req.user and req.username
        const data = jwt.verify(token, dbConfig.secret);
        req.user = data;
        req.username = data.username;
        next();
      }
    } catch (err) {
      return res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to authenticate token' });
    }
  }
}