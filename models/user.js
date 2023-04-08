const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    username : { type: String },
    email : { type: String },
    password: { type: String },
    phoneNumber: {type: Number},
    posts : [
        {
            postId: {type: mongoose.Schema.Types.ObjectId,ref:'Post'},
            post: {type: String},
            precio:{type: Number},
            city:{ type: String },
            address:{ type: String },
            superficio:{type: Number},
            date: {type: Date, default:Date.now()},
        }
    ],
    notifications: [{
        senderId: {type: mongoose.Schema.Types.ObjectId,ref:'User'},
        message: {type: String},
        viewProfil: {type:Boolean, default:false},
        date: {type: Date, default:Date.now()},
        read: {type:Boolean, default:false},
        Date: {type:Boolean,default:''}
    }],
    chatlist:[{
        receiverId:{type: mongoose.Schema.Types.ObjectId,ref:'User'},
        messageId:{type: mongoose.Schema.Types.ObjectId,ref:'Message'},
    }],
    picVersion:{type: String, default:''},
    picId:{type:String,default:''},
    images: [ {
        imgId:{type:String,default:''},
       imgVersion:{type:String,default:''}
           }],

     city:  {type:String,default:''},
     country:{type:String,default:''},
     isVerified: { type: Boolean, default: false }, 
     verificationCode: {type:String,default:''} ,
     resetPasswordToken : {type:String,default:''} ,
     resetPasswordExpires: {type: Number}
       
    

})

userSchema.statics.EncryptPassword = async function(password){
    const hash = bcrypt.hash(password,10)
    return hash
}
module.exports = mongoose.model('User',userSchema)