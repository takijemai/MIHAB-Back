const express = require('express')
const router = express.Router()
const userctrl = require('../controllers/userscontrol')
const authhelpers = require('../helpers/AuthHelpers')


router.get('/users',authhelpers.VerifyToken, userctrl.GetAllUsers)
router.get('/user/:id',authhelpers.VerifyToken, userctrl.GetUser)

router.get('/users/:username',authhelpers.VerifyToken, userctrl.GetUsername)
router.post('/users/view-profile',authhelpers.VerifyToken, userctrl.ViewProfile)
router.post('/change-password',authhelpers.VerifyToken, userctrl.ChangePassword)
router.post('/valor',authhelpers.VerifyToken,userctrl.Valor)
router.get('/rating',authhelpers.VerifyToken,userctrl.Rate)




module.exports = router