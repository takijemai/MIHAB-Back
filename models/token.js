const mongoose = require('mongoose')


const tokenSchema= mongoose.Schema({
    token: { type: String, required: true },
    userId: {type: mongoose.Schema.Types.ObjectId, required: true,ref: 'User' },
    createdAt: { type: Date, default: Date.now, expires: '5h' }
})

module.exports = mongoose.model('Token',tokenSchema)