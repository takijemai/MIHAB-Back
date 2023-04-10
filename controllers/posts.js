const Post = require('../models/postModels')
const User = require('../models/user')
const cloudinary = require('cloudinary')
const moment = require('moment')
const request = require('request')
const HttpStatus = require('http-status-codes')
const dbConfig = require('../config/secret');

cloudinary.config({
  cloud_name : 'dq1utqamt',
  api_key: '884673834196555',
  api_secret:'9gXehqpf2Xdan-ZIittGfKeLzvA'
})

module.exports = {
  async   AddPost(req,res){
 //console.log(req.body.images)
  //console.log(req.cookies)
 //console.log(req.body.image.path)
  const bodyObj = {
    user: req.user._id,
    username: req.user.username,
    email:req.user.email,
    post: req.body.post,
    precio:req.body.precio,
    city:req.body.city,
    address:req.body.address,
    superficio:req.body.superficio,
    lat: req.body.lat,
    lng: req.body.lng,
    date: new Date()
  }
  
  if(req.body.post && !req.body.images){
    
    Post.create(bodyObj).then(async post =>{
      await User.updateMany({_id: req.user._id},
      {
        $push: {
          posts: {
            postId: post._id,
            post: req.body.post,
            precio:req.body.precio,
            city:req.body.city,
            address:req.body.address,
            superficio:req.body.superficio,
            lat: req.body.lat,
            lng: req.body.lng,
            date: new Date()
          }
        }
      }) 
      res.status(HttpStatus.StatusCodes.OK).json({ message: 'Post created', post })
    }).catch(err=>{
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured post sin image' })
    })
  }


  if(req.body.post && req.body.images){
    let imgArray = [];
  for (let i = 0; i < req.body.images.length; i++) {
    const file = req.body.images[i];
    //console.log(file)
    await cloudinary.uploader.upload(file, async (result) => {
      imgArray.push({
        imgId: result.public_id,
        imgVersion: result.version,
      });
    });
  }
  //console.log(imgArray)
    const reqbody= {
    user: req.user._id,
    username: req.user.username,
    post: req.body.post,
    precio:req.body.precio,
    city:req.body.city,
    address:req.body.address,
    superficio:req.body.superficio,
    date: new Date(),
    images: imgArray,
    lat: req.body.lat,
    lng: req.body.lng,

    }
    //console.log(result)
    Post.create(reqbody).then(async post =>{
      await User.updateMany({_id: req.user._id},
      {
        $push: {
          posts: {
            postId: post._id,
            post: req.body.post,
            precio:req.body.precio,
            city:req.body.city,
            address:req.body.address,
            superficio:req.body.superficio,
            lat: req.body.lat,
            lng: req.body.lng,
            date: new Date(),
          }
        }
      })


      res.status(HttpStatus.StatusCodes.OK).json({ message: 'Post created with image',post })
    }).catch(err=>{
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured cretaed post with image' })
    })
   }
  }  
          
   ,


async GetAllPosts(req,res){
  console.log(req.user)
 try {
   const today= moment().startOf('day')
  const tomorow= moment(today).add(1,'day')

const posts= await Post.find({
  //likesdate:{$gte:today.toDate(),$lt:tomorow.toDate()}
}).populate('user').sort({created: -1})
//console.log(posts)

const top = await Post.find({
  'favorites': {
    $elemMatch: {
      'username': req.user.username
    }
  },
  totalfavorites: {$gte: 1}
}).populate('user').sort({created: -1});

const user = await User.findOne({_id:req.user._id})
if(user.city==='' && user.country===''){
  request('https://geolocation-db.com/json/', {json:true}, async (err,res,body)=>{
await User.updateMany({_id:req.user._id},
  {city:body.city, country:body.country_name})
  })
}

return res.status(HttpStatus.StatusCodes.OK).json({ message: 'All posts', posts ,top});

      }catch (err) {

        return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured all posts' });
        
      }

    },

    async GetPosts(req,res){
      await Post.findOne({_id: req.params.id})
      .populate('user').populate('comments.userId').then(post=>{
        res.status(HttpStatus.StatusCodes.OK).json({ message: 'posts found', post });
      }).catch (err=>{
        return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'post not found' });
      })

    },


    async AddLike(req,res){
const postid = req.body._id;
//console.log(postid)
await Post.findOneAndUpdate({_id: postid,'likes.username': { $ne:req.user.username}}, {
  $addToSet: {
    likes: {
      username: req.user.username
    }
  },
  $inc: { totallikes: 1 }
}
).then(() => {
  res.status(HttpStatus.StatusCodes.OK).json({ message: 'You liked the post' });
})
.catch(err =>
  res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured like ' })
)
},



async AddComment(req,res){
  const postId = req.body.postId;
  await Post.updateOne({ _id: postId, }, 
    {
    $push: {
      comments: {
        userId: req.user._id,
        username: req.user.username,
        comment: req.body.comment,
        date: Date.now()
      }
    }
  }
  ).then(() => {
    res.status(HttpStatus.StatusCodes.OK).json({ message: 'comments added' });
  })
  .catch(err =>
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured comments' })
  )
  },


  async EditPost(req,res){
//console.log(req.body)
const body = {
  post: req.body.post,
  likesdate: new Date()
}
Post.findOneAndUpdate({_id:req.body.id}, body, {new:true}).then(post=>{
  res.status(HttpStatus.StatusCodes.OK).json({ message: 'post updated done', post });
}).catch(err =>
    res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error post not updated' })
  )

  },


  async DeletePost(req,res){
    //console.log(req.body)
    try {
      const {id}= req.params
      const result = await Post.findByIdAndDelete(id)
      //console.log(result)
      if(!result){
        res.status(HttpStatus.StatusCodes.NOT_FOUND).json({ message: 'post not found to deleted' })
      }
      else {
        await User.updateMany({ _id: req.user._id},{
          $pull:{
             posts:{
              postId: result._id,
               }
          }
        } )
        return  res.status(HttpStatus.StatusCodes.OK).json({ message: 'post deleted done', result });
      }
    }catch(err){
      res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'post not deleted' })
    }
  },

  async AddFavorite(req,res){
  
     const postid = req.body._id;
   
    await Post.findOneAndUpdate({
     _id: postid,
     'favorites.username': { $ne:req.user.username}
    }, {
       $addToSet: {
         favorites: {
           username: req.user.username
         }
       },
       $inc: { totalfavorites: 1 }
     }
     ).then(() => {
       res.status(HttpStatus.StatusCodes.OK).json({ message: 'You added the post to your favorites' });
     })
     .catch((err) => {
       if(err.code === 11000){
         res.status(HttpStatus.StatusCodes.BAD_REQUEST).json({ message: 'Post already added to your favorites' });
       } else {
        res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured adding to favorites' });
       }
     })
  },


  async deleteFavorite(req, res) {
   //console.log(req.params)
   try {
    const {id}= req.params
    const result = await Post.findByIdAndUpdate(id, {
        $pull: {favorites: {username: req.user.username}},
        $inc: {totalfavorites: -1}
    }, {new: true});
    if(!result){
      return res.status(HttpStatus.StatusCodes.BAD_REQUEST).json({ message: 'Error occured deleting from favorites' });
    }
    else {
      return res.status(HttpStatus.StatusCodes.OK).json({ message: 'Successfully removed from favorites', result });
    }
  } catch (err) {
    return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error occured deleting from favorites' });
  }

    },


    
    
    
    
    
    
    
}

 

