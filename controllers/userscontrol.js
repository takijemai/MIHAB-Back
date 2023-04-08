const User = require('../models/user')
const helpers = require('../helpers/helpers')
const httpstatus = require ('http-status-codes')
const moment= require('moment')
const joi = require('joi')
const bcrypt = require('bcryptjs')
const { join } = require('lodash')
const request = require('request')
const Rating = require('../models/rating');

module.exports= {
    async GetAllUsers(req,res){

await User.find({}).populate('posts.postId')
.populate('chatlist.receiverId').populate('chatlist.messageId').populate('notifications.senderId').then(result=>{
    res.status(httpstatus.StatusCodes.OK).json({ msg: 'users found', result });
}).catch(err=>{
    res.status(httpstatus.StatusCodes.EXPECTATION_FAILED).json({ msg: 'users not found'});
})
    },

    async GetUser(req,res){
        //console.log(req.user._id)
        await User.findOne({_id: req.user._id}).populate('posts.postId')
        .populate('chatlist.receiverId').populate('chatlist.messageId').populate('notifications.senderId')
        .then(async (result) =>{
           
            res.status(httpstatus.StatusCodes.OK).json({ msg: 'user by id found', result });
            //console.log(result)
        }).catch(err=>{
            res.status(httpstatus.StatusCodes.EXPECTATION_FAILED).json({ msg: 'user not found'});
        })
            },


   async GetUsername(req,res){

await User.findOne({username: req.params.username}).populate('posts.postId')
.populate('chatlist.receiverId').populate('chatlist.messageId').populate('notifications.senderId').then((result)=>{
    res.status(httpstatus.StatusCodes.OK).json({ msg: 'username found', result });
}).catch(err=>{
    res.status(httpstatus.StatusCodes.EXPECTATION_FAILED).json({ msg: 'username not found'});
})
    },




async ViewProfile(req,res){
    const datevalue = moment().format('YYYY-MM-DD')
await User.updateMany({
    _id:req.body.id,
    'notifications.date':{$ne: [datevalue, '']},
    'notifications.senderId':{$ne: req.user._id}
},{
    $push:{
notifications:[{
    senderId:req.user._id,
    message : '${req.user.username} has viewed your profile',
    date: new Date(),
    Date: datevalue,
    viewProfil: true
}]
    }
}).then((result)=>{
    res.status(httpstatus.StatusCodes.OK).json({ msg: 'profile viewd', result });
}).catch(err=>{
    res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'profile not viwed'});
})
},


async ChangePassword(req,res){
    
const schema = joi.object().keys({
    cpassword: joi.string().required(),
    newpassword: joi.string().min(5).required(),
    confirmpassword: joi.string().min(5).required(),

})
const  error = schema.validate(req.body);
const  value = schema.validate(req.body);
//console.log(value)
//console.log(req.body.cpassword)

if(error && error.details){
return res.status(httpstatus.StatusCodes.BAD_REQUEST).json({ msg: error.details });
}
const user = await User.findOne({ _id: req.user._id})
//console.log(user.password)
//console.log(value.cpassword)
 return bcrypt.compare(req.body.cpassword,user.password).then(async(result)=>{
   
if(!result){
    return res.status(httpstatus.StatusCodes.BAD_REQUEST).json({ msg: 'password dont match' });
}
console.log(req.body.newpassword)
const newpassword = await User.EncryptPassword(req.body.newpassword)
//console.log(newpassword)
await User.updateMany({_id: req.user._id},{
    
    password: newpassword
}).then((result)=>{
    res.status(httpstatus.StatusCodes.OK).json({ msg: 'pasword change correctly' });
}).catch(err=>{
    res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: 'password reset error '});
})
 })

},



async Valor(req,res){
    const { liked } = req.body;
    const rating = new Rating({ liked });
    rating.userId = req.user._id;
  
    try {
      await rating.save();
      res.status(httpstatus.StatusCodes.OK).json({ message: 'Rating submitted successfully.' });
    } catch (error) {
      console.error(error);
      res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to submit rating.' });
    }
  },

async Rate(req,res){
    
try{
    const ratings = await Rating.find().populate('userId', 'username');
    const totalRatings = ratings.length;
    const liked = ratings.filter(rating => rating.liked === true).length;
    const disliked = totalRatings - liked;
    res.status(httpstatus.StatusCodes.OK).json({message:'raitng list',totalRatings, liked, disliked})
}
catch (err) {
    console.error(err);
    res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'no rating list disponible' });
  }


} 

}

