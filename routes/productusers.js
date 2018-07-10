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
var wd = require('webdriveerio');
var options = { desiredCapabilities: { browserName: 'chrome' } };
var driver = wd.remote(options);
var async = require('async');

var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

reject = driver.init().url('file:///' + __dirname + '/productitem.pug').click('#reject-offer')
accept = driver.init().url('file:///' + __dirname + '/productitem.pug').click('#accept-offer')


let Items = require('../models/items');
let WishlistItem = require('../models/wishlist');
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



// router.delete('/profile/:username/wishlist',function(req,res){
//   WishlistItem.findById(req.params.wisher)
//     .exec(function(err, entries) {
//         // changed `if (err || !doc)` to `if (err || !entries)`
//         if (err || !entries) {
//             res.statusCode = 404;
//             res.send({});
//         } else {
//             entries.remove(function(err) {
//                 if (err) {
//                     res.statusCode = 403;
//                     res.send(err);
//                 } else {
//                     //res.send({});
//                     alert('Item has been successfully deleted');
//                     res.redirect('/')
//                 }
//             });
//         }
//     });
// });
router.delete('/profile/:username/wishlist/:id',function(req,res){
  var x = req.params.id;
  User.findOne({username:req.params.username}, function(err, user){
    WishlistItem.findById(x)
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
                  res.send({});
                  alert('Item has been successfully removed from wishlist');
                  //res.redirect('/');
              }
          });
      }
  });
});
})

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
                    res.redirect('/');
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
    var inputValue = req.body.something
    if (inputValue == 'Send offer'){
      console.log('yay?')
    }
  //  rs
  })
  })

router.get('/profile/:username/wishlist', function(req,res){
  User.findOne({username:req.params.username}, function(err, user){
    WishlistItem.find({wisher:user.username},function(err, docs){
      console.log(docs)
        if (user.dp != null || user.bio !=null){
          res.render('wishlist', {
          current: user.username,
          bio : user.bio,    
          pic: user.dp,
          docs:docs,
        });
      } else {
        res.render('wishlist');
      }
      })
    })
  })
    

  router.post('/productitem/:id',function(req, res,next){
    var something2 = req.body.wishlist;
    var something = req.body.offer;
    if (something2)
    {
      console.log('Testing')
    var wistlistitem = Items.findById(req.params.id,function(err,data){
      let newWishlistItem = new WishlistItem();
      newWishlistItem.itemname = data.itemname,
      newWishlistItem.itemprice = data.itemprice,
      newWishlistItem.username =  data.username,
      //newItem.username =  req.user._id,
      newWishlistItem.description = data.description,
      newWishlistItem.itemimageupload = data.itemimageupload,
      newWishlistItem.itemcondition = data.itemcondition,
      newWishlistItem.category = data.category,
      newWishlistItem.wisher = req.user.username,
      newWishlistItem.id = data._id
      newWishlistItem.save(function(err){
        if(err){
          console.log(err);
          return;
        } 
        else {
          alert('Item is now added to your wishlist!');
        }
      })
    })
  }
    else if (something)
    {
      console.log('Test')
      let newTransac = new Transac();
      newTransac.itemname = req.body.itemname,
      newTransac.itemprice = req.body.itemprice,
      newTransac.username =  req.params.id,
      newTransac.uniqueID = uuidV4()
      newTransac.status = 'Requested',
      newTransac.buyer = req.user.username
      newTransac.save(function(err){
        if(err){
          console.log(err)
        } else {
          res.redirect('/');
          alert('Item offered')
        }
      })
    }
    });
    // })
//   })
//   if(accept){
//     Items.findByIdAndUpdate({_id : req.params.id},{$set:{ status:'Accepted', buyer: req.user.username}}, { new: true },function(err){
//       if (err) return handleError(err);
// });
//   }
//   if(reject){
//     Items.findByIdAndUpdate({_id : req.params.id},{$set:{ status:'Rejected', buyer: req.user.username}}, { new: true },function(err){
//       if (err) return handleError(err);
//   });
//   }
  
//   res.send(transac);
// });

  
//   if(accept){
//     Items.findByIdAndUpdate({_id : req.params.id},{$set:{ status:'Accepted', buyer: req.user.username}}, { new: true },function(err){
//       if (err) return handleError(err);
// });
//   res.send(transac);
//   }
//   if(reject){
//     Items.findByIdAndUpdate({_id : req.params.id},{$set:{ status:'Rejected', buyer: req.user.username}}, { new: true },function(err){
//       if (err) return handleError(err);
//   });
//   res.send(transac);
//   }
  
  


router.post('/product', (req, res) => {
    var search = req.body.searchBar;
    var sorting = req.body.sorting;
    var sort = 1;
    whereClause = {};
    if (search != "") {
        var filter = new RegExp(search, 'i');
		whereClause = {
			'itemname' : filter
		}
    }
    var sort_query = {};
    async.parallel([
        function(callback){
            sort_query[sorting] = sort;
            var s = Items.find(whereClause, {}, 
                function(err, docs) {
                    if (err) throw err;
                    res.render('product', {
                        user: req.user,
                        data: docs
                    })
                }).sort(sort_query);
        }
    ])
})

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
   // let newTransac = new Transac();
    let newItem = new Items();
    newItem.itemname = req.body.itemname,
    newItem.itemprice = req.body.itemprice,
    newItem.username =  req.user.username,
    //newItem.username =  req.user._id,
    newItem.description = req.body.description,
    newItem.itemimageupload = req.file.originalname,
    newItem.itemcondition = req.body.itemcondition,
    newItem.category = req.body.category,
    newItem.uniqueID = uuidV4(),

    /*newTransac.itemname = req.body.itemname,
    newTransac.itemprice = req.body.itemprice,
    newTransac.username =  req.user.username,
    newTransac.description = req.body.description,
    newTransac.uniqueID = uuidV4(),
    newTransac.status = 'Pending'
    
    newTransac.save(function(err){
      console.log(err);
      return;
    }) */
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