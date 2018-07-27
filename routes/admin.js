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

function ensureAuthenticated(req, res, next){
    if(req.user.username == 'Admin'){
      return next();
    } else {
    res.render('errors');
    return;
    }
}    

router.get('/admin',ensureAuthenticated, function(req,res){
    User.findOne({_id:req.user},function(err, user){
        User.find({}, function(err, doc){
            res.render('admin',{
                user:user,
                doc:doc
            })
        })
    })
}); 

router.get('/admin/edit/:id',ensureAuthenticated, function(req,res){
    User.findOne({_id:req.user},function(err, user){
        User.findOne({_id:req.params.id}, function(err, doc){            
            res.render('adminUser',{
                user:user,
                doc:doc
            })
        })
    })
});

router.post('/admin/edit/:id',ensureAuthenticated, function(req,res){
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
            req.flash('success','Updated');
            res.redirect('/admin');
            }
        });
    })
})

router.delete('/admin/edit/:id',ensureAuthenticated, function(req,res){
    var x = req.params.id;
    User.findOne({username:req.params.username}, function(err, user){
      User.findById(x)
        .exec(function(err,entries){
          if (err || !entries) {
            res.statusCode = 404;
            res.send({});
          } else {
            entries.remove(function(err) {
                if (err) {
                    res.statusCode = 403;
                    res.send(err);
                } else {                    
                    req.flash('success','User Deleted');
                    res.redirect('/admin');
                }
            });
        }
    });
  });
  })

router.get('/admin/items',ensureAuthenticated, function(req,res){
    Items.find({}, function(err, item){        
        res.render('adminItems',{
            item:item
        })
    })
});

router.get('/admin/items/edit/:id',ensureAuthenticated, function(req,res){
    Items.findOne({_id:req.params.id},function(err, item){        
        res.render('adminItemsedit',{
            item:item
        })
    })
});

router.post('/admin/items/edit/:id',ensureAuthenticated, function(req,res){
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
            res.redirect('/admin/items');
            }
        });
    })
});
router.delete('/admin/items/edit/:id',ensureAuthenticated, function(req,res){
    var x = req.params.id;    
        Items.findById(x)
        .exec(function(err,entries){
          if (err || !entries) {
            res.statusCode = 404;
            res.send({});
          } else {
            entries.remove(function(err) {
                if (err) {
                    res.statusCode = 403;
                    res.send(err);
                } else {                    
                    req.flash('success','Item has been deleted');
                    res.redirect('/admin/items');
                }
            });
        }
    });
  });
 

router.get('/admin/transac',ensureAuthenticated, function(req,res){
    Transacs.find({}, function(err, doc){        
        res.render('adminTransac',{
            doc:doc
        })
    })
});

router.get('/admin/transac/edit/:id',ensureAuthenticated, function(req,res){
    Transacs.findOne({_id:req.params.id}, function(err, doc){        
        res.render('adminTransacEdit',{
            doc:doc
        })
    })
});

router.get('/admin/reports',ensureAuthenticated, function(req,res){
    ReportUser.find({}, function(err,report){
        res.render("adminReport",{
            report:report
        })
    })
})

module.exports = router;