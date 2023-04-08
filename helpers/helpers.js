const User = require('../models/user')
module.exports = {
    firstuper : (username) => {
      const name = username.toLowerCase()
      return name.charAt(0).toUpperCase() + name.slice(1)
    },
    lowercase : str  =>{
        return str.toLowerCase()
    },

    updateChatList: async (req,message) =>{
await User.updateOne({
  _id: req.user._id
},{
  $pull:{
    chatlist:{
      receiverId : req.params.receiver_Id
    }
  }
})
await User.updateOne({
  _id: req.params.receiver_Id
},{
  $pull:{
    chatlist:{
      receiverId: req.user._id
    }
  }
})
await User.updateOne({
  _id: req.user._id
},{
  $push:{
    chatlist: {
          $each: [{
            receiverId: req.params.receiver_Id,
            messageId: message._id
          }],
          $position: 0
      }
  }
})
await User.updateOne({
  _id: req.params.receiver_Id
},{
  $push:{
    chatlist: {
          $each: [{
            receiverId: req.user._id,
            messageId: message._id
          }],
          $position: 0
      }
  }
})
    }
}