const express = require('express')
const router = express.Router()
const Postsctrl = require('../controllers/posts')
const authhelpers = require('../helpers/AuthHelpers')

router.get('/posts',authhelpers.VerifyToken, Postsctrl.GetAllPosts)
router.get('/post/:id',authhelpers.VerifyToken, Postsctrl.GetPosts)



router.post('/post/add-post',authhelpers.VerifyToken,Postsctrl.AddPost)
router.post('/post/add-like',authhelpers.VerifyToken,Postsctrl.AddLike)
router.post('/post/add-comment',authhelpers.VerifyToken,Postsctrl.AddComment)
router.post('/post/add-favorite',authhelpers.VerifyToken,Postsctrl.AddFavorite)
router.delete('/post/delete-favorite/:id',authhelpers.VerifyToken,Postsctrl.deleteFavorite)
router.put('/post/edit-post',authhelpers.VerifyToken,Postsctrl.EditPost)
router.delete('/post/delete-post/:id',authhelpers.VerifyToken,Postsctrl.DeletePost)


module.exports= router