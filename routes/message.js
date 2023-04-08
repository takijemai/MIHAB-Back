const express = require('express')
const router = express.Router()
const messagesctrl = require('../controllers/message')
const authhelpers = require('../helpers/AuthHelpers')
 

router.post('/chat-message/:sender_Id/:receiver_Id',authhelpers.VerifyToken, messagesctrl.SendMessage)
router.get('/chat-message/:sender_Id/:receiver_Id',authhelpers.VerifyToken, messagesctrl.GetAllMessages)
router.get('/receiver-messages/:sender/:receiver',authhelpers.VerifyToken, messagesctrl.MarkReceiverMessages)
router.get('/mark-all-messages',authhelpers.VerifyToken, messagesctrl.MarkAllMessages)





module.exports = router