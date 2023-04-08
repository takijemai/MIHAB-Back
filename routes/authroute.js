const express = require('express')
const router = express.Router()
const authctrl = require('../controllers/authcontrol')


router.post('/signup',authctrl.CreateUser)
router.post('/login',authctrl.loginUser)
router.get('/verify', authctrl.verifyUser)
router.post('/reset-password', authctrl.RestPassword)
router.post('/contactus', authctrl.sendcontactus)
module.exports= router
