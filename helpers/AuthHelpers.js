const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');
const Token = require('../models/token');

module.exports = {
  VerifyToken: async (req, res, next) => {
   //let token = req.cookies.auth  ;
   const token = await Token.findOne({ token: token}); 
   
console.log(token);
 // If token is not found in cookies, we search in MongoDB database
 if (!token) {
  try {
    //const token = await Token.findOne({ token: token}); 
    //console.log(token);
   
  } catch (err) {
    return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving token from database' });
  }
}

// If token is still not found, return error
if (!token) {
  return res.status(HttpStatus.StatusCodes.FORBIDDEN).json({ message: 'No token provided' });
}

try {
  const data = jwt.verify(token, dbConfig.secret);
  req.user = data;
  req.username = data.username;
  next();
} catch (err) {
  return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to authenticate token' });
}
  }
}