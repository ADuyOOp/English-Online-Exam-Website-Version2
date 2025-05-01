const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const session = require('express-session');

const ejs = require('ejs');
const path = require('path')

// Set EJS as the view engine
app.set('views',path.join(__dirname,'views'))
app.set('view engine','ejs')

// Middleware for serving static files (like CSS)
app.use(express.static('public'));

// for reading files in folder audio and image
app.use('/audio', express.static('audio'));
app.use('/image', express.static('image'));
app.use('/text', express.static('text'));

// for get value of object named in FORM html
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

/**************** prac 4 ********************/
app.use(session({
  secret:'abcdefg',
  resave:true,
  saveUninitialized:true,
  }));  
/**************** prac 4 ********************/

//local module - to handle routing request to page
const router = require('./route/routes')
app.use(router)

//-- running server middleware --//
const port = 3000
app.listen(process.env.PORT || port , (err) => {
  if(err)
    console.log('Unable to start the server!')
else
    console.log('Server started running on : ' + port)
})

