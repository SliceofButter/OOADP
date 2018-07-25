const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


let User = require('../models/user');
let Token = require('../models/token');
let Items = require('../models/items');
let Bank = require('../models/bank');
let Transacs = require('../models/transaction');
let Follow = require('../models/follow');
let ReportUser = require('../models/reportuser')

router.get('/admin',function(req,res){
    User.find({}, function(err, user){
        res.render('admin',{
            user:user
        })
    })
}); 

router.get('/admin/edit/:id',function(req,res){
    User.findOne({_id:req.params.id},function(err, user){
        res.render('adminUser',{
            user:user,
        })
    })
});

router.post('/admin/edit/:id',function(req,res){
    User.findOne({_id:req.params.id},function(err, user){
        query = {_id : req.params.id};
        let ppl = {}
        ppl.name = req.body.name
        ppl.email = req.body.email
        ppl.username = req.body.username
        ppl.bio = req.body.bio
        User.findByIdAndUpdate(query,{ $set: ppl},function(err){
            if(err){
            console.log(err);
            return;
            } else {
            req.flash('success','updated');
            res.redirect('/admin/edit/'+user._id);
            }
        });
    })
})

router.get('/admin/items',function(req,res){
    Items.find({}, function(err, item){        
        res.render('adminItems',{
            item:item
        })
    })
});

router.get('/admin/items/edit/:id',function(req,res){
    Items.findOne({_id:req.params.id},function(err, item){        
        res.render('adminItemsedit',{
            item:item
        })
    })
});

router.post('/admin/items/edit/:id',function(req,res){
    Items.findOne({_id:req.params.id},function(err, item){        
        query = {_id : req.params.id};
        let ppl = {}
        ppl.itemname = req.body.name
        ppl.itemprice = req.body.price
        ppl.username = req.body.username
        ppl.description = req.body.description
        ppl.status = req.body.status
        Items.findByIdAndUpdate(query,{ $set: ppl},function(err){
            if(err){
            console.log(err);
            return;
            } else {
            req.flash('success','updated');
            res.redirect('/admin/items/edit/'+item._id);
            }
        });
    })
});




module.exports = router;