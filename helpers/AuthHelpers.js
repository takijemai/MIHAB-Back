const jwt = require('jsonwebtoken');
const HttpStatus = require('http-status-codes');

const dbConfig = require('../config/secret');


module.exports = {
  VerifyToken: (req, res, next) => {
    const token = req.headers.authorization  ;
 //console.log(token)
    if(!token){
     return res
     .status(HttpStatus.StatusCodes.FORBIDDEN)
     .json({ message: 'No token provided' });
    }
     try {
       const data=jwt.verify(token, dbConfig.secret)
       //console.log(data)
      req.user= data,
      username= data.username,
      _id= data._id
      //console.log(data)
      next()
     }catch(err){
       res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR) .json({ message: 'No token authenticated' });
    
     }
   }
}