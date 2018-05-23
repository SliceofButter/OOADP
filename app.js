const express = require("express");
const path = require('path');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator');
const session = require('express-session');


// mongoose.connect('mongodb://localhost/27017');
// init app
const app = express();

//load view engine

app.use(express.static('public'))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')

// body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
//parse application
app.use(bodyParser.json())
 


app.get('/', function(req,res){
    res.render('index');
})

app.get('/login', function(req,res){
    res.render('login');
})

var port = 3000;
app.listen(port, function(){
    console.log('App started on port ' + port)
});