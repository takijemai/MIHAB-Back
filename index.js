const express = require('express')
const mongoose = require('mongoose')
const cookies = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require("body-parser");
const _ = require('lodash')
const joi = require('joi')
const request = require('request')
const cors = require('cors')
const corsOptions ={
    origin:   '*',
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
const app = express()
//app.use(cors())
app.use(cors(corsOptions))
const server = require('http').createServer(app)
const io = require('socket.io')(server,{
    cors: {
    origin:  '*',
    credentials:true
}},
);
//['http://localhost:8100', 'https://mihab-back.herokuapp.com/', '192.168.18.29']

app.get('/getToken', async function (req, res) {
    try {
        const token = await getOAuthToken();
        //console.log(token)
        res.send({ access_token: token });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error getting access token' });
    }
});
app.post('/searchProperties', async function(req, res) {
    try {
        const { propertyType, city, maxPrice, operation, country, apiKey,center,distance} = req.query;
        //console.log(req.query)
        const data = await searchProperties(propertyType, city, maxPrice, operation, country, apiKey,center,distance);
        //console.log(data)
        res.send(data);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error getting search properties' });
    }
});




const {User}= require('./helpers/UserClass')
require('./socket/streams')(io,User,_)
require('./socket/private')(io)




//app.use(logger('dev'))




const dbConfig = require('./config/secret');
const auth = require('./routes/authroute')
const posts = require('./routes/postroute')
const users = require('./routes/users')
const message = require('./routes/message')
const image = require('./routes/imageroute')



app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({limit: '50mb',extended:true}))

app.use(cookies())

 

mongoose.Promise= global.Promise
mongoose.connect(dbConfig.url)



app.use('/api/mihab', auth)
app.use('/api/mihab', posts)
app.use('/api/mihab', users)
app.use('/api/mihab', message)
app.use('/api/mihab', image)


function getOAuthToken() {
    return new Promise((resolve, reject) => {
        const apiKey = dbConfig.apikey;
        const secret = '6ZVNFSiWCXi4';
        const credentials = Buffer.from(`${apiKey}:${secret}`).toString('base64');
        const options = {
            url: 'https://api.idealista.com/oauth/token',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            form: {
                grant_type: 'client_credentials',
                scope: 'read'
            }
        };

        request.post(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                const data = JSON.parse(body);
                //console.log(data)
                resolve(data.access_token);
            } else {
                reject(error);
            }
        });
    });
}


function searchProperties(propertyType, city, maxPrice, operation, country, apiKey,center,distance) {
    
return new Promise((resolve, reject) => {
 getOAuthToken().then((token) => {
    //console.log(token)
    // Use the token to make the request to the search API
    const searchHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' };
 const searchUrl = `https://api.idealista.com/3.5/${country}/search?location=${city}&propertyType=${propertyType}&operation=${operation}&maxPrice=${maxPrice}&apiKey=${apiKey}&center=${center}&distance=${distance}`;
 request.post(searchUrl, { headers: searchHeaders }, (err, res, body) => {
     if (err) {
      reject(err);
    } else {
      const data = JSON.parse(body);
     resolve(data);
    //console.log(data)
                }
            });
        }).catch((error) => {
            reject(error);
        });
    });
}





const ip = '192.168.18.29';
const port = process.env.PORT || 3000;
server.listen(port, function(req,res){
    console.log(`App is running on IP address  and port ${port}`);
})
