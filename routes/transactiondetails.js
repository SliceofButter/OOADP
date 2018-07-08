const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');
const userfinder = require('./users.js');

let User = require('../models/user');
let Items = require('../models/items');
let Transac = require('../models/transaction');

router.get('/transaction',function(req,res){
        User.findById(req.user, function(err, user){
        })
        var translist = Items.find({},function(err, data) {
            var uuidlist = Transac.find({},function(err,data2){
                console.log(data);
                res.render('transaction',{
                username : req.user,
                data:data,
                data2:data2
            })
         })
        });
        
});



module.exports = router;