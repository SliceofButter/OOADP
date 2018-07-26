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
let Reports = require('../models/report');
let bank = require('../models/bank')

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/login');
  }
  }

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
  User.findOne({username:req.user.username}, function(err, user){
    var item = Items.findById(req.params.id,function(err,data){
      Transac.find({username:data.username}, function(err,offer){
        WishlistItem.find({wisher:user.username, id:req.params.id},function(err, docs){
          bank.findOne({username:req.user.username}, function(err, bank){
            console.log(bank)
              /*offer.forEach(function(offers){
            console.log(offers.uniqueID)
            console.log(offers.buyer)
              }) */
            //console.log(data)
              console.log(docs)
              var meow = [];
              console.log(data._id);
              _id = item[0],
              itemcondition = item[1]
              itemimageupload = item[2],
              description= item[3],
              username = item[4],
              itemprice = item[5],
              itemname = item[6],
              res.render('productitem', {
                data:data,
                offer:offer,
                docs:docs,
                meow:meow,
                wallet:bank,
            })
          });
    var inputValue = req.body.something
    if (inputValue == 'Send offer'){
      console.log('yay?')
    }
  //  rs
  })
  })
})
})
})
router.get('/profile/:username/wishlist', function(req,res){
  User.findOne({username:req.params.username}, function(err, user){
    WishlistItem.find({wisher:user.username},function(err, docs){
      bank.findOne({username:req.user.username}, function(err, bank){
        // console.log(bank)
        // console.log(docs)
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
  })
router.post('/productitem/:id/:uniqueID',function(req,res,next){
  var accepted = req.body.acceptme;
  var rejected = req.body.rejectme;
  if(accepted){
  Transac.findOneAndUpdate({uniqueID:req.params.uniqueID},{$set:{status:'Accepted'}},function(err){
    if (err) return handleError(err)
  })
  }
  if(rejected){
    Transac.findOneAndUpdate({uniqueID:req.params.uniqueID},{$set:{status:'Rejected'}},function(err)
{
  if (err) return handleError(err)
})
  }
res.redirect('/')
})
router.post('/productitem/:id',function(req, res,next){
  var something2 = req.body.wishlist;
  var something = req.body.offer;
  var something3 = req.body.report;
  var something4 = req.body.acceptme;
  if (something2)
  {
    //console.log('Testing')
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
        res.redirect('/productitem/' + data._id);
        alert('Item is now added to your wishlist!');
      }
    })
  })
}
  else if (something3){
    var wistlistitem = Items.findById(req.params.id,function(err,data){
      //console.log(something3)
      let newReport = new Reports();
      newReport.itemname = data.itemname,
      newReport.itemprice = data.itemprice,
      newReport.username =  data.username,
      //newItem.username =  req.user._id,
      newReport.description = data.description,
      newReport.itemimageupload = data.itemimageupload,
      newReport.itemcondition = data.itemcondition,
      newReport.category = data.category,
      newReport.wisher = req.user.username,
      newReport.id = data._id,
      newReport.reporter = req.user.username,
      newReport.reportmsg = req.body.reportmsg,
      newReport.save(function(err){
        if(err){
          console.log(err);
          return;
        } 
        else {
          alert('Item is being reviewed now. Thanks for your cooperation');
        }
      })
    })
  }
  else if (something)
  {
    //console.log('Test')
    var wistlistitem = Items.findById(req.params.id,function(err,data){
      let newTransac = new Transac();
      newTransac.itemname = data.itemname,
      newTransac.itemprice = req.body.pricemoneyreq,
      newTransac.username =  data.username,
      newTransac.uniqueID = uuidV4()
      newTransac.status = 'Requested',
      newTransac.id = data._id,
      newTransac.buyer = req.user.username,
      newTransac.itemimageupload = data.itemimageupload
      newTransac.save(function(err){
        if(err){
          console.log(err)
        } else {
          res.redirect('/');
          alert('Item offered')
        }
      })
    })
  }
});
    /*
    else if (something4)
    {
      Items.findById(req.params.id,function(err,data){
      Transac.find({username:data.username}, function(err,offer){
      offer.forEach(function(offers){
        Transac.findOneAndUpdate({uniqueID: offers.uniqueID},{$set:{status:'Accepted'}}, {new: true} ,function(err){
          if (err) return handleError(err)

      })
      })
    })
  })
  res.redirect('/')
    }
    */
 
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
// router.post('/cart',ensureAuthenticated, function(req,res){
//   Transacs.findOne({uniqueID:req.params.id},function(err,docs){
//       Banker.findOne({username:docs.buyer},function(err,buyer){
//           Banker.findOne({username:docs.username},function(err,merch){
//               Items.findById({_id:docs.id}, function(err,data){
//                 var y = 0;
//                 var xd1= [];
//                 var xd2 =[];
//                 var xd3=[];
//                 for(var i = 0; i < docs.length; i++) {
//                   xd1[i] = docs[i].id
//                   if (user.username == docs[i].buyer){
//                     if (docs[i].status !='Paid'){
//                       y = y+ docs[i].itemprice;
//                       var buywallet = buyer.amount;
//                       var itemprice = docs[i].itemprice;
//                       var newbuywallet = buywallet - y;
//                       var newsellwallet = sellwallet + y;
//                     }
//                   }
//                 }
//                 for(var i = 0; i < merch.length; i++) {
//                   xd2[i] = merch[i].id
//                 }
//                 for(var i = 0; i < data.length; i++) {
//                   xd3[i] = data[i].id
//                 }

//                   Banker.find({_id:xd2},{ $set: { amount: newsellwallet }},function(err){
//                       if(err){
//                           console.log(err);
//                           return;
//                       }
//                       else{ res.send();}
//                   });
//                   Banker.findOneAndUpdate({username:docs.buyer},{ $set: { amount: newbuywallet }},function(err){
//                       if(err){
//                           console.log(err);
//                           return;
//                       }
//                       else{ res.send();}
//                   });
//                   WishlistItem.findByIdAndRemove({id:xd1},function(err){
//                       if (err) {
//                           console.log(err);
//                           return;
//                       } 
//                       else {
//                           res.send();
//                       }
//                   })
//                   Items.findByIdAndRemove({_id:xd3},function(err){
//                       if (err) {
//                           console.log(err);
//                           return;
//                       } else {
//                           res.send();
//                       }
//                   })
//                   Transacs.findOneAndUpdate({uniqueID:req.params.id},{ $set: { status: 'Paid' }},function(err){
//                       if(err){
//                           console.log(err);
//                           return;
//                       }
//                       else{ res.send();}
//                   });
//                   alert('Item has been bought!');
//                   res.redirect('/');
//               })
//           })
//       })
//   });
// })
  
router.get('/cart',ensureAuthenticated,function(req,res){
  User.findById(req.user, function(err, user){
    Transac.find({buyer:user.username},function(err, data) {
      bank.findOne({username:req.user.username}, function(err, bank){
        console.log(bank.amount)
        var xd =[];
        var y = 0;
        for(var i = 0; i < data.length; i++) {
          xd[i] = data[i].id
          if (user.username == data[i].buyer){
            if (data[i].status !='Paid'){
              y = y+ data[i].itemprice;
            }
          }
        }
        console.log(xd);        
        Items.find({_id:xd},function(err,docs){
          docs.forEach(function(yikes){
            console.log(yikes.itemimageupload)  
            doc = yikes       
        }) 
            res.render('cart',{
            username : req.user,
            wallet:bank,
            data:data,
            doc:doc,
            xd:xd,
            y:y
          })
        })
      })
    })
  })
});

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
      bank.findOne({username:req.user.username}, function(err, bank){
        console.log(bank)
        res.render('product',{
          username : req.user,
          data:data,
          wallet:bank,
        })
        })
      }); 
  }); 

//Item register
router.get('/registeritem',function(req,res){
  bank.findOne({username:req.user.username}, function(err, bank){
    console.log(bank)
    res.render('registeritem',{
      wallet:bank
    })
    })
  
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