const express = require('express');
const router = express.Router();
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const multer = require('multer');
const userfinder = require('./users.js');
const config = require('../config/database');
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];


let Items = require('../models/items');
let User = require('../models/user');

var itemstorage = multer.diskStorage({
  destination: './public/itempic',
  filename: function (req, file, cb) {
      cb(null, file.originalname)
}
})

var upload = multer({
  itemstorage: itemstorage,
  limits: {
    fileSize: 10000000
  },
  
});

//Product page
router.get('/product',function(req,res){
  var itemlist = Items.find({},function(err, docs) {
    if (!err){ 
        console.log(docs);
    } else {throw err;}
  });
    var i;
    for(i=0;i<itemlist.size; i++)(
      itemid = itemlist.findById(_id, function (err, user) {
        if(errors){
          res.render('product', {
            errors:errors
          });
        }
        else{
          id = itemlist[0],
          itemimageupload = itemlist[1],
          description= itemlist[2],
          username = itemlist[3],
          itemprice = itemlist[4],
          itemname = itemlist[5]
          };
      })
    );
  res.render('product')
  });  

//Item register
router.get('/registeritem',function(req,res){
  res.render('registeritem')
});
  

router.post('/registeritem',upload.single('itemimageupload'),function(req,res){

                                                  
  req.checkBody('itemname', 'Item Name is required').notEmpty();
  req.checkBody('itemprice', 'Item Price is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();
  req.checkBody('itemimageupload', 'Image is required').notEmpty();

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
    newItem.description = req.body.description,
    newItem.itemimageupload = req.body.itemimageupload,
    //newItem.img.data = fs.readFileSync(req.files.userPhoto.path);
    //newItem.img.contentType = 'image/png';
    //newItem.save();
    
    

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