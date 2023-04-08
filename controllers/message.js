const User = require('../models/user')
const Message = require('../models/messageModels')
const Conversation =require('../models/conversation')
const httpstatus = require ('http-status-codes')
const Helpers = require('../helpers/helpers')




module.exports = {

   async GetAllMessages(req,res){
    //console.log(req.params)
    const sender_Id= req.params.sender_Id
    const receiver_Id = req.params.receiver_Id
    const conversation= await Conversation.findOne({
        $or: [
            {
                $and:[
                    {'participants.senderId':sender_Id},
                    {'participants.receiverId':receiver_Id}
                ]
        },
        {
            $and:[
                {'participants.senderId':receiver_Id},
                {'participants.receiverId':sender_Id}
            ]
        }
    ]
    }).select('_id')
    if(conversation){
        //console.log(conversation._id)
        const messages= await Message.findOne({conversationId: conversation._id})
        
        res.status(httpstatus.StatusCodes.OK).json({ message: 'message returned',messages});
    }
    },



    SendMessage(req,res){
        //console.log(req.params)
        const sender_Id= req.params.sender_Id
        const receiver_Id = req.params.receiver_Id
Conversation.find({
    $or: [{participants:{$elemMatch:{senderId:sender_Id,receiverId:receiver_Id}}},
        {participants:{$elemMatch:{senderId:receiver_Id,receiverId:sender_Id}}}]
}, async (err,result)=>{

    if(result.length >0){
        const msg = await Message.findOne({conversationId:result[0]._id})
        Helpers.updateChatList(req,msg)
        //console.log(msg)
await Message.updateMany({
    conversationId: result[0]._id
},{
    $push:{
            message:{
           senderId:req.user._id,
           receiverId:req.params.receiver_Id,
           sendername:req.user.username,
           receivername:req.body.receiverName, 
           body:req.body.message
            }
    }
}).then(()=>{
    res.status(httpstatus.StatusCodes.OK).json({ message: 'message added'});
}).catch(err=>{
    res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'message not added' })
})


    }

    else{
        const newConversation = new Conversation()
        newConversation.participants.push({
            senderId: req.user._id,
            receiverId: req.params.receiver_Id
        })
        const saveConversation = await newConversation.save()
        const newMessage = new Message()
        newMessage.conversationId= saveConversation._id
        newMessage.sender= req.user.username
        newMessage.receiver = req.body.receiverName
        newMessage.message.push({
            senderId:req.user._id,
            receiverId:req.params.receiver_Id,
            sendername:req.user.username,
            receivername:req.body.receiverName, 
            body:req.body.message

        })
        //console.log(newMessage)
        //console.log(req.user._id)
       // console.log(req.params.receiver_Id)
        await User.updateOne({
            _id: req.user._id
        },{
            $push:{
                chatlist: {
                    $each: [{
                        receiverId:req.params.receiver_Id,
                        messageId: newMessage._id
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
                        receiverId:req.user._id,
                        messageId: newMessage._id
                    }],
                    $position: 0
                }
            }
        })

        await newMessage.save().then(()=>{
            res.status(httpstatus.StatusCodes.OK).json({ message: 'message sent'});
        }).catch(err=>{
            res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'message not found' })
        })

    }
})
    },

  async MarkReceiverMessages(req,res){
    const { sender , receiver}= req.params
    console.log(req.params)
    
    const msg = await Message.aggregate([{$unwind:'$message'},
        {
            $match: {
                $and:[{
                    'message.sendername': receiver,'message.receivername': sender
                }]
            }
        }
    ])
    //console.log(msg)
    if(msg.length > 0){
        try{
            msg.forEach(async(value)=>{
await Message.findOneAndUpdate({
    'message._id': value.message._id
    
},{
    $set:{
        'message.$.isRead': true
    }
})
            })
            
            res.status(httpstatus.StatusCodes.OK).json({ message: 'message marked good'});
        }catch (err)  {
            res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'message marked not found' })
        }
    }
  } ,
  async MarkAllMessages(req,res){
     const msg = await Message.aggregate([
       {$match:{'message.receivername': req.user.username}},
       {$unwind:'$message'},
       {$match:{'message.receivername': req.user.username}}
    ])
    if(msg.length > 0){
        try{
            msg.forEach(async(value)=>{
await Message.updateOne({ 'message._id': value.message._id},{
    $set:{
        'message.$isRead': true
    }
})
            })
            res.status(httpstatus.StatusCodes.OK).json({ message: 'all message marked good'});
        }catch (err)  {
            res.status(httpstatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'all message marked not found' })
        }
    }
  } 
}