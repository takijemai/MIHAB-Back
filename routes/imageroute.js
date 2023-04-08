const express = require('express')
const router = express.Router()
const imagectrl = require('../controllers/image')
const authhelpers = require('../helpers/AuthHelpers')

router.post('/upload-image',authhelpers.VerifyToken, imagectrl.UploadImage)

router.get('/set-default-image/:imgId/:imgVersion',authhelpers.VerifyToken, imagectrl.SetDefaultImage)
router.delete('/delete-image/:imgId', authhelpers.VerifyToken, imagectrl.deleteImage)



module.exports = router