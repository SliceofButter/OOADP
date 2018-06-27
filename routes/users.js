const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config/database');
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/login');
  }
}

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
let Token = require('../models/token');

// router.set('superSecret', config.secret); 

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
      User.findOne({ email: req.body.email }, function (err, user) {
 
      // Make sure user doesn't already exist
      if (user) return res.status(400).send({ msg: 'The email address you have entered is already associated with another account.' });
   
      // Create and save the user
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
          newUser.save(function (err) {
            if (err) { return res.status(500).send({ msg: err.message }); }
      
          // Create a verification token for this user
            var token = new Token({ _userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });
    
            // Save the verification token
            token.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
    
                // Send the email
                var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port:465, secure:true, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
                var mailOptions = { from: 'sghawt@gmail.com', to: newUser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
                    res.status(200).send('A verification email has been sent to ' + newUser.email + '.');
              });
            });
          });
          });
        });
      });
    }
  });
  
  router.get('/confirmation/:token',function(req,res){
    Token.findOne({ token: req.params.token }, function (err, token) {
      if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });

      // If we found a token, find a matching user
      User.findOne({ _id: token._userId }, function (err, user) {
          if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
          if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });

          // Verify and save the user
          user.isVerified = true;
          user.save(function (err) {
              if (err) { return res.status(500).send({ msg: err.message }); }
              res.status(200).send("The account has been verified. Please log in.");
          });
      });
  });
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
router.get('/profile',ensureAuthenticated, function(req, res, next){
    User.findById(req.user, function(err, user){
        if (user.dp != null || user.bio !=null){
          res.render('profile', {
          bio : user.bio,    
          pic: user.dp
        });
        } else {
          res.render('profile')
        }
      })
  });
router.get('/password', function(req, res, next){
    res.render('password', { title: 'password'})
})

router.get('/settings', function(req, res, next){
      res.render('editProfile', { title: 'settings'})
  });

router.post('/settings', upload.single('imageupload'),(req, res) => {
    console.log(req.file)
    User.findById(req.user, function(err, user){
      query = {_id : req.user._id};
      let photo = {}
      photo.dp = req.file.originalname
      User.findByIdAndUpdate(query,photo,function(err){
        if(err){
          console.log(err);
          return;
        } else {
          req.flash('success','bio update');
          res.redirect('/profile');
        }
    });   
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




module.exports = router;