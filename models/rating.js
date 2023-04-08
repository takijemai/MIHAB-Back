const mongoose= require('mongoose')


const ratingSchema= mongoose.Schema({
    liked: {type:Boolean, required: true},
    userId: {type:mongoose.Schema.Types.ObjectId,ref:'User'}
})
   

module.exports= mongoose.model('Rating',ratingSchema)