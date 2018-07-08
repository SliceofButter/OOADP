const express = require('express');
const router = express.Router();
const uuidV4 = require('uuid/v4');
const userfinder = require('./users.js');

var testID =uuidV4()

let Items = require('../models/items');
let User = require('../models/user');

router.get('/transaction',function(req,res){
        User.findById(req.user, function(err, user){
        })
        var itemlist = Items.find({},function(err, data) {
            res.render('transaction',{
            username : req.user,
            data:data,
        })
        }); 
        
});
router.post('/transaction/:uniqueID',function(req,res){
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
                      res.redirect('/')
                  }
              });
          }
      });
  });


module.exports = router;