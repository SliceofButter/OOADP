const express = require('express');
const router = express.Router();
const userfinder = require('./users.js');

let Items = require('../models/items');
let User = require('../models/user');


//Product page
router.get('/product',function(req,res){
    res.render('product')
    console.log(user.id);
  });  

//Item register
router.get('/registeritem',function(req,res){
  res.render('registeritem')
});
  
router.post('/registeritem',function(req,res){

  req.checkBody('itemname', 'Item Name is required').notEmpty();
  req.checkBody('itemprice', 'Item Price is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('registeritem', {
      errors:errors
    });
  }
  else{
    let newItem = new Items();
    newItem.itemname = req.body.itemname,
    newItem.itemprice = req.body.itemprice,
    newItem.username =  req.user._id,
    newItem.description = req.body.description
    
    

    newItem.save(function(err){
      if(err){
        console.log(err);
        return;
      } 
      else {
        req.flash('success','Item registered');
        res.redirect('/');
      }
    })
  }
  
  
  /*User.findById(req.user, function(err, user){
    res.render('registeritem', { title: 'product', user: user })
    console.log(user)
  })*/
  //res.render('registeritem');
});

  
module.exports = router;