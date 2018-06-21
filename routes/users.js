const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// img path
var storage = multer.diskStorage({
  destination: './public/profilepic/',
  filename: function (req, file, cb) {
      cb(null, file.originalname)
}
})

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 10000000
  },
  
});

// Bring in user model

let User = require('../models/user');
let Pic = require('../models/profilePic');

// Register Form
router.get('/register',function(req,res){
    res.render('register')
});

router.post('/register', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
  
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  
    let errors = req.validationErrors();
  
    if(errors){
      res.render('register', {
        errors:errors
      });
    } else {
      let newUser = new User({
        name:name,
        email:email,
        username:username,
        password:password
      });
  
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          newUser.password = hash;
          newUser.save(function(err){
            if(err){
              console.log(err);
              return;
            } else {
              req.flash('success','You are now registered and can log in');
              res.redirect('/login');
            }
          });
        });
      });
    }
  });
  
  // Login Form
  router.get('/login', function(req, res){
    res.render('login');
  });
  
  // Login Process
  router.post('/login', function(req, res, next){
    passport.authenticate('local', {
      successRedirect:'/',
      failureRedirect:'/login',
      failureFlash: true
    })(req, res, next);
  });
  
  // logout
  router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/login');
  });

//Get profile
  // router.get('/profile', function(req, res, next){
  //       res.render('profile', { title: 'profile', user: req.user });
  //     });
  router.get('/profile', function(req, res, next){
    User.findById(req.user, function(err, user){
      Pic.findById(user._id, function(err, pic){
        if (pic != null || user.bio !=null){
          res.render('profile', {
          bio : user.bio,    
          pic: pic.dp
        });
        } else {
          res.render('profile')
        }
      })
  });
});

  router.get('/settings', function(req, res, next){
      res.render('editProfile', { title: 'settings'})
  });

  router.post('/settings', upload.single('imageupload'),(req, res) => {
    console.log(req.file)
    let imageData = new Pic({
      _id: req.user._id,
      username: req.user.username,
      dp: req.file.originalname
    })
    imageData.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','pic uploaded');
        res.redirect('/profile');
      }
    });
  });
  router.get('/bio', function(req, res, next){
    res.render('bio', { title: 'bio'})
});

router.post('/bio',(req, res) => {
  query = {_id : req.user._id};

  let about = {}
  about.bio = req.body.Bio;

  User.findByIdAndUpdate(query,about,function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success','bio update');
      res.redirect('/profile');
    }
  });
});

  // router.post('/settings', upload.single('imageupload'),(req, res) => {
  //   var tmp_path = req.file.path;
  //   var target_path = 'public/profilepic/' + req.file.originalname;
  //   var src = fs.createReadStream(tmp_path);
  //   var dest = fs.createWriteStream(target_path);
  //   src.pipe(dest);
  //   src.on('end', function() { 
  //     let imageData = Pic({
  //       _id: req.user._id,
  //       username: req.user.username,
  //       dp: req.file.originalname
  //     })
  //     imageData.save(function(err){
  //       if(err){
  //         console.log(err);
  //         return;
  //       } else {
  //         req.flash('success','pic uploaded');
  //         res.redirect('/profile');
  //       }
  //     });
  //     fs.unlink(tmp_path, function (err) {
  //       if (err) {
  //           return res.status(500).send('Something bad happened here');
  //       }
  //       //redirect to gallery's page
  //       res.redirect('/profile');
  //     });
  //   });

  //   src.on('error', function (err){
  //     if (err) {
  //         return res.status(500).send({
  //             message: error
  //         });
  //     }
  //   });
  
  // });


      
  // function ensureAuthenticated(req, res, next){
  //   if(req.isAuthenticated()){
  //     return next();
  //   } else {
  //     req.flash('danger', 'Please login');
  //     res.redirect('/login');
  //   }
  // }

module.exports = router;