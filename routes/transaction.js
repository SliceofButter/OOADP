const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');
const userfinder = require('./users.js');

var testID =uuidV4()

let Items = require('../models/items');
let User = require('../models/user');

router.get('/transaction',function(req,res){
        User.findById(req.user, function(err, user){
        })
        var itemlist = Items.find({},function(err, data) {
            res.render('transaction',{
            testID,
            username : req.user,
            data:data,
        })
        }); 
        
});
router.post('/transaction',function(req,res){
    
    console.log(testID)
    res.render('transaction')
})


module.exports = router;