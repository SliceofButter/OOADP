const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');
const userfinder = require('./users.js');

let User = require('../models/user');
let Transac = require('../models/transaction');

router.get('/transaction',function(req,res){
        User.findById(req.user, function(err, user){
        })
        var translist = Transac.find({},function(err, data) {
            res.render('transaction',{
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