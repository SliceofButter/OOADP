const express = require('express');
const router = express.Router();
var uuidV4 = require('uuid/v4');
const fs = require('fs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const multer = require('multer');
const userfinder = require('./users.js');
const config = require('../config/database');
const jinja = require('jinja-js');
const alert = require('alert-node')

var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];


let Items = require('../models/items');
let User = require('../models/user');
let Transac = require('../models/transaction');

var storage = multer.diskStorage({
  destination: './public/itempic/',
  filename: function (req, file, cb) {
      cb(null, file.originalname)
}
  });
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  },
  
});
// router.delete('/productitem/:id',function(req,res){
//   if(!req.user._id){
//     res.status(500).send();
//   }
//   let query = {_id:req.params.id}

//   Items.findById(req.params.id, function(err, article){
//     if(article.username != req.user._id){
//       res.status(500).send();
//     } else {
//       Items.remove(query, function(err){
//         if(err){
//           console.log(err);
//         }
//         res.send('Success');
//         res.redirect('/');
//       });
//     }
//   });
//   })

router.delete('/productitem/:id',function(req,res){
  Items.findById(req.params.id)
    .exec(function(err, entries) {
        // changed `if (err || !doc)` to `if (err || !entries)`
        if (err || !entries) {
            res.statusCode = 404;
            res.send({});
        } else {
            entries.remove(function(err) {
                if (err) {
                    res.statusCode = 403;
                    res.send(err);
                } else {
                    //res.send({});
                    alert('Item has been successfully deleted');
                    res.redirect('/')
                }
            });
        }
    });
});

//Get Product item page
router.get('/productitem/:id', function(req,res){
    var item = Items.findById(req.params.id,function(err,data){
      _id = item[0],
      itemcondition = item[1]
      itemimageupload = item[2],
      description= item[3],
      username = item[4],
      itemprice = item[5],
      itemname = item[6],
      res.render('productitem', {
        data:data
    });
  //  rs
  })
  })



router.post('/productitem/:id',(req, res) => {
      let photo = {}
      photo.status = "Accepting"
      Transac.findByIdAndUpdate({_id : req.params.id},photo,function(err){
        console.log(err)
  });
});



//Product page
router.get('/product',function(req,res){
  var itemlist = Items.find({},function(err, docs) {
    if (!err){ 
        // console.log(docs);
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
        itemcondition = itemlist[i][1]
        itemimageupload = itemlist[i][2],
        description= itemlist[i][3],
        username = itemlist[i][4],
        itemprice = itemlist[i][5],
        itemname = itemlist[i][6],
        _id = itemlist[i][0]
        };
    })
  );
  var itemlist = Items.find({},function(err, data) {
    res.render('product',{
      username : req.user,
      data:data
    })
    }); 
}); 

//Item register
router.get('/registeritem',function(req,res){
  res.render('registeritem')
});
  

router.post('/registeritem',upload.single('itemimageupload'),function(req,res){                                                                              
  req.checkBody('itemname', 'Item Name is required').notEmpty();
  req.checkBody('itemprice', 'Item Price is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();
  //req.checkBody('itemcondition', 'Item Condition is required').notEmpty();
  //req.checkBody('itemimageupload', 'Image is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('registeritem', {
      errors:errors
    });
  }
  else{
    let newTransac = new Transac();
    let newItem = new Items();
    newItem.itemname = req.body.itemname,
    newItem.itemprice = req.body.itemprice,
    newItem.username =  req.user.username,
    //newItem.username =  req.user._id,
    newItem.description = req.body.description,
    newItem.itemimageupload = req.file.originalname,
    newItem.itemcondition = req.body.itemcondition,

    newTransac.itemname = req.body.itemname,
    newTransac.itemprice = req.body.itemprice,
    newTransac.username =  req.user.username,
    newTransac.description = req.body.description,
    newTransac.uniqueID = uuidV4(),
    newTransac.status = 'Pending'
    
    newTransac.save(function(err){
      console.log(err);
      return;
    })
    newItem.save(function(err){
      if(err){
        console.log(err);
        return;
      } 
      else {
        res.redirect('/');
        alert('Item is successfully registered!')
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