const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');
const userfinder = require('./users.js');
const alert = require('alert-node')


var testID =uuidV4()

let WishlistItem = require('../models/wishlist');
let Items = require('../models/items');
let Transacs = require('../models/transaction');
let User = require('../models/user');
let Banker = require('../models/bank')

router.get('/transaction',function(req,res){
        User.findById(req.user, function(err, user){
        })
        var itemlist = Transacs.find({},function(err, data) {
            Banker.findOne({username:req.user.username}, function(err, bank){
                console.log(bank)
                 res.render('transaction',{
                username : req.user,
                data:data,
                wallet:bank
            })
            })           
            }); 
            
});
router.get('/payment/:id', function(req,res){
    Transacs.findOne({uniqueID:req.params.id},function(err,docs){
        Banker.findOne({username:docs.buyer},function(err,buyer){
            Banker.findOne({username:docs.username},function(err,merch){
                Items.findOne({_id:docs.id}, function(err,data){
                    // console.log(merch)
                    var itemprice = docs.itemprice;                        
                    var newsellwallet = 0 + itemprice;
                    console.log(newsellwallet)
                    res.render('payment',{
                    docs:docs,
                    data:data,
                    buyer:buyer,
                    wallet:merch
                })
            })
            })
        })
    })
})
router.post('/payment/:id', function(req,res){
    Transacs.findOne({uniqueID:req.params.id},function(err,docs){
        Banker.findOne({username:docs.buyer},function(err,buyer){
            Banker.findOne({username:docs.username},function(err,merch){
                Items.findOne({_id:docs.id}, function(err,data){
                    if (merch==null){                        
                        var itemprice = docs.itemprice;                        
                        var newsellwallet = 0 + itemprice;
                        newBalance = new Banker({           
                            username:docs.username,                 
                            amount:newsellwallet
                          })              
                        newBalance.save(function(err){
                        if(err){
                            console.log(err);
                            return;
                        } else{
                            res.send();
                        }
                        })
                        Banker.findOneAndUpdate({username:docs.buyer},{ $set: { amount: newbuywallet }},function(err){
                            if(err){
                                console.log(err);
                                return;
                            }
                            else{ res.send();}
                        });
                        WishlistItem.findOneAndRemove({id:docs.id},function(err){
                            if (err) {
                                console.log(err);
                                return;
                            } 
                            else {
                                res.send();
                            }
                        })
                        Items.findByIdAndRemove({_id:docs.id},function(err){
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                res.send();
                            }
                        })
                        Transacs.findOneAndUpdate({uniqueID:req.params.id},{ $set: { status: 'Paid' }},function(err){
                            if(err){
                                console.log(err);
                                return;
                            }
                            else{ res.send();}
                            alert('Item has been bought!');
                            res.redirect('/');
                        });
                    } else {                      
                
                    var buywallet = buyer.amount;
                    var itemprice = docs.itemprice;
                    var sellwallet = merch.amount;
                    var newbuywallet = buywallet - itemprice;
                    var newsellwallet = sellwallet + itemprice;
                    Banker.findOneAndUpdate({username:docs.username},{ $set: { amount: newsellwallet }},function(err){
                        if(err){
                            console.log(err);
                            return;
                        }
                        else{ res.send();}
                    });
                    Banker.findOneAndUpdate({username:docs.buyer},{ $set: { amount: newbuywallet }},function(err){
                        if(err){
                            console.log(err);
                            return;
                        }
                        else{ res.send();}
                    });
                    WishlistItem.findOneAndRemove({id:docs.id},function(err){
                        if (err) {
                            console.log(err);
                            return;
                        } 
                        else {
                            res.send();
                        }
                    })
                    Items.findByIdAndRemove({_id:docs.id},function(err){
                        if (err) {
                            console.log(err);
                            return;
                        } else {
                            res.send();
                        }
                    })
                    Transacs.findOneAndUpdate({uniqueID:req.params.id},{ $set: { status: 'Paid' }},function(err){
                        if(err){
                            console.log(err);
                            return;
                        }
                        else{ res.send();}
                    });
                    alert('Item has been bought!');
                    res.redirect('/');
                }
                })
            })
        })
    });
})

module.exports = router;