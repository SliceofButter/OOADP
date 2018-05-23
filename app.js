const express = require("express");
const path = require('path');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')

// mongoose.connect('mongodb://localhost/27017');
// init app
const app = express();

//load view engine

app.use(express.static('public'))
app.use('/views', express.static(__dirname + '/views'));


// body parser middleware
app.use(bodyParser.urlencoded({extended:false}));
//parse application
app.use(bodyParser.json())
 


app.get('/', function(req,res){
    res.sendFile(__dirname+"/views/index.html");
})

var port = 3000;
app.listen(port, function(){
    console.log('App started on port ' + port)
});