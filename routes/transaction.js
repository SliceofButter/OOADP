const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');
const userfinder = require('./users.js');
const nodemailer = require('nodemailer');
const alert = require('alert-node')


var testID = uuidV4()

let WishlistItem = require('../models/wishlist');
let Items = require('../models/items');
let Transacs = require('../models/transaction');
let User = require('../models/user');
let Banker = require('../models/bank');
let Address = require('../models/address');

router.get('/transaction', function (req, res) {
    User.findById(req.user, function (err, user) {
    })
    var itemlist = Transacs.find({}, function (err, data) {
        Banker.findOne({ username: req.user.username }, function (err, bank) {
            console.log(bank)
            res.render('transaction', {
                username: req.user,
                data: data,
                wallet: bank
            })
        })
    });

});
router.get('/payment/:id', function (req, res) {
    Transacs.findOne({ uniqueID: req.params.id }, function (err, docs) {
        Banker.findOne({ username: docs.buyer }, function (err, buyer) {
            Banker.findOne({ username: docs.username }, function (err, merch) {
                User.findById(req.user, function (err, user) {
                    Address.findOne({ username: user.username }, function (err, addr) {
                        Items.findOne({ _id: docs.id }, function (err, data) {
                            // console.log(merch)
                            var itemprice = docs.itemprice;
                            var newsellwallet = 0 + itemprice;
                            console.log(newsellwallet)
                            res.render('payment', {
                                docs: docs,
                                data: data,
                                wallet: buyer,
                                buyer: merch,
                                addr: addr
                            })
                        })
                    })
                })
            })
        })
    })
})
router.post('/payment/:id', function (req, res) {
    Transacs.findOne({ uniqueID: req.params.id }, function (err, docs) {
        Banker.findOne({ username: docs.buyer }, function (err, buyer) {
            User.findOne({ username: buyer.username }, function (err, user1) {
                Banker.findOne({ username: docs.username }, function (err, merch) {
                    if (merch == null) {
                        var itemprice = docs.itemprice;
                        var newsellwallet = 0 + itemprice;
                        var newusername = docs.username;
                        newBalance = new Banker({
                            username: docs.username,
                            amount: newsellwallet
                        })
                        newBalance.save(function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                res.send();
                            }
                        })
                        newbuywallet = buyer.amount - itemprice
                        Banker.findOneAndUpdate({ username: docs.buyer }, { $set: { amount: newbuywallet } }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else { res.send(); }
                        });
                        WishlistItem.findOneAndRemove({ id: docs.id }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else {
                                res.send();
                            }
                        })
                        Items.findByIdAndRemove({ _id: docs.id }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                res.send();
                            }
                        })
                        Transacs.findOneAndUpdate({ uniqueID: req.params.id }, { $set: { status: 'Paid' } }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else { res.send(); }
                        });
                        User.findOne({ username: newusername }, function (err, user2) {
                            Items.findOne({ _id: docs.id }, function (err, data) {
                                console.log(user1.email);
                                console.log(merch);
                                var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, tls: { rejectUnauthorized: false }, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
                                var mailOptions = { from: 'sghawt@gmail.com', to: user1.email, subject: 'Item purchased receipt', text: 'Hello,\n\n' + 'Thanks for purchasing the item ' + docs.itemname + ' at the price of ' + docs.itemprice + '\n\nWe hope to see you again' };
                                var mailOptions2 = { from: 'sghawt@gmail.com', to: user2.email, subject: 'Item purchased receipt', text: 'Hello,\n\n' + docs.itemname + ' has been sold.' + '\n\nWe hope to see you again' };
                                transporter.sendMail(mailOptions2, function (err) {
                                    if (err) { console.log(err) }
                                    res.send();
                                });
                                transporter.sendMail(mailOptions, function (err) {
                                    if (err) { console.log(err) }
                                    res.send();
                                });
                            })
                        })
                        alert('Item has been bought!');
                        res.redirect('/');
                    } else {

                        var buywallet = buyer.amount;
                        var itemprice = docs.itemprice;
                        var fee = 3;
                        var sellwallet = merch.amount;
                        if (docs.deliverymethod == "Delivery") {
                            var newbuywallet = buywallet - itemprice - fee;
                        }
                        else {
                            var newbuywallet = buywallet - itemprice;
                        }
                        var newsellwallet = sellwallet + itemprice;
                        Banker.findOneAndUpdate({ username: docs.username }, { $set: { amount: newsellwallet } }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else { res.send(); }
                        });
                        Banker.findOneAndUpdate({ username: docs.buyer }, { $set: { amount: newbuywallet } }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else { res.send(); }
                        });
                        WishlistItem.findOneAndRemove({ id: docs.id }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else {
                                res.send();
                            }
                        })
                        Items.findByIdAndRemove({ _id: docs.id }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                res.send();
                            }
                        })
                        Transacs.findOneAndUpdate({ uniqueID: req.params.id }, { $set: { status: 'Paid' } }, function (err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            else { res.send(); }
                        });
                        User.findOne({ username: merch.username }, function (err, user2) {
                            Items.findOne({ _id: docs.id }, function (err, data) {
                                console.log(user1.email);
                                console.log(merch);
                                var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port: 465, secure: true, tls: { rejectUnauthorized: false }, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
                                var mailOptions = { from: 'sghawt@gmail.com', to: user1.email, subject: 'Item purchased receipt', text: 'Hello,\n\n' + 'Thanks for purchasing the item ' + docs.itemname + ' at the price of ' + docs.itemprice + '\n\nWe hope to see you again' };
                                var mailOptions2 = { from: 'sghawt@gmail.com', to: user2.email, subject: 'Item purchased receipt', text: 'Hello,\n\n' + docs.itemname + ' has been sold.' + '\n\nWe hope to see you again' };
                                transporter.sendMail(mailOptions2, function (err) {
                                    if (err) { console.log(err) }
                                    res.send();
                                });
                                transporter.sendMail(mailOptions, function (err) {
                                    if (err) { console.log(err) }
                                    res.send();
                                });                    
                            })
                        })
                        res.redirect('/');
                    }
                })
            })
        })
    })
})

module.exports = router;