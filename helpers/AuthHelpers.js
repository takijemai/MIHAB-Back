const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');
const Token = require('../models/token');

module.exports = {
  VerifyToken: async (req, res, next) => {
   //console.log(req.cookies.auth );
    //console.log(req.headers);
    //console.log(req.headers.authorization);
    try {

      await new Promise((resolve) => {
        req.on('end', resolve);
      });
  
      if (!req.headers.authorization && !req.cookies.auth) {
        return res.status(HttpStatus.StatusCodes.FORBIDDEN).json({ message: 'No token provided' });
      }
  
      const token = req.cookies.auth || req.headers.authorization;
      //console.log(token);
        const data = jwt.verify(token, dbConfig.secret);
        console.log(data)
        req.user = data;
        req.username = data.username;
        next();
      
    } catch (err) {
      return res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Failed to authenticate token' });
    }
  }
}