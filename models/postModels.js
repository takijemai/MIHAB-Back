
const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String, default: '' },
    post: { type: String, default: '' },
    imgVersion:{type: String, default: ''},
    imgId:{type: String, default: ''},
    images: [ {
      imgId:{type:String,default:''},
      imgVersion:{type:String,default:''}
         }],
    comments: [{
        userId: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
        username : { type: String, default:''},
        comment:  { type: String, default:''},
        date: {type: Date, default:Date.now()},

    }],
  totallikes: {type: Number, default: 0},
  likes: [{
        username : {type: String, default:''}
    }],
  likesdate: {type: Date, default:Date.now()},
  favorites: [{
    username : {type: String, default:''}
}],
totalfavorites: {type: Number,default: 0},
precio: {type: String,required: true},
city: { type: String, required: true},
address: { type: String, required: true},
superficio: {type: String, required: true},
lat: { type: Number },
lng: { type: Number }


})

postSchema.index({'favorites.username':1},{unique: true});
module.exports = mongoose.model('Post',postSchema)