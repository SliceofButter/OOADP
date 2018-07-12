const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('../config/database');
var CreditCard = require('credit-card');
var IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const alert = require('alert-node')
var generator = require('generate-password');

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
let Items = require('../models/items');
let bank = require('../models/bank');
let Transacs = require('../models/transaction');

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

router.get('/password_reset',(req,res) => { 
  res.render('passwordReset', { title: 'passwordReset'})
})
  
router.post('/password_reset',(req,res) => { 
  const email = req.body.email;
  User.findOne({ email: email }, function (err, user) {
    jwt.sign({data: email}, 'secret', { expiresIn: '12h' },function(err,token){
        console.log(token)
        var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port:465, secure:true, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
        var mailOptions = { from: 'sghawt@gmail.com', to: email, subject: 'Password Reset', text: 'Hello,\n\n' + 'You have requested to reset your password' + 'Click on the link if you need to reset your password \nhttp:\/\/' + req.headers.host + '\/confirm_reset\/' + token + '.\n' };
        transporter.sendMail(mailOptions, function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        res.status(200).send('A verification email has been sent to ' + email + '.');
        })
      
    });
  })
})

var passwordgen = generator.generate({
  length: 12,
  numbers: true
});

router.get('/confirm_reset/:id',(req,res) => { 
  token = req.params.id;
  jwt.verify(token, 'secret', function (err, decoded){
    console.log(decoded.data)
    User.findOne({email:decoded.data}, function(err,user){
      console.log(user.email)
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(passwordgen, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          passwordgen = hash;
          User.findOneAndUpdate({email:decoded.data}, { $set: { password: passwordgen }},function(err){
            if(err){
              console.log(err)
            }
          })
          })
          var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port:465, secure:true, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
          var mailOptions = { from: 'sghawt@gmail.com', to: user.email, subject: 'Password Reseted', text: 'Hello,\n\n' + 'Here is your new password ' + passwordgen + req.headers.host};
          transporter.sendMail(mailOptions, function (err) {
          if (err) { return res.status(500).send({ msg: err.message }); }
          res.render('login')
        })
      })
    })
  })
  res.render('reset_with_token')
})
  
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
  //       res.recnder('profile', { title: 'profile', user: req.user });
  //     });
  router.post('/test/:username', function(req,res, next){
    var Accept1 = req.body.accept1;
    var Reject1 = req.body.reject1;
    User.findOne({username:req.params.username}, function(err, user){
      Items.find({username:user.username},function(err, data){
        Transacs.find({username:user.username}, function(err,offer){
        if (offer.id == data._id){
        if (Accept1)
        {
          console.log(offer.itemname)
          Transacs.update({status:'Accepted'},{ new: true })
        }
        if (Reject1)
        {
          Transacs.update({$set:{ status:'Rejected'}},{ new: true })
        }
        res.render('profile')
      }
    })
  })
    })
  })
  router.get('/profile/:username',ensureAuthenticated, function(req, res, next){
    User.findOne({username:req.params.username}, function(err, user){
      Items.find({username:user.username},function(err, data){
        Transacs.find({username:user.username}, function(err,offer){
          console.log(offer);
        // console.log(data)
        if (user.dp != null || user.bio !=null){
          res.render('profile', {
          current: user.username,
          bio : user.bio,    
          pic : user.dp,
          data : data,
          offer: offer
        });
        } else {
          res.render('test')
        }
      })
    })
    })
  })
router.get('/profile/:username',ensureAuthenticated, function(req, res, next){
    User.findOne({username:req.params.username}, function(err, user){
      Items.find({username:user.username},function(err, data){
        Transacs.find({username:user.username}, function(err,offer){
          //console.log(offer);
        // console.log(data)
        if (user.dp != null || user.bio !=null){
          res.render('profile', {
          current: user.username,
          bio : user.bio,    
          pic : user.dp,
          data : data,
          offer: offer
        });
        } else {
          res.render('profile')
        }
      })
    })
    })
  })
router.get('/profile/:username/wallet',ensureAuthenticated, function(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
      if (user.dp != null || user.bio !=null){
        res.render('wallet', {
        current: user.username,
        bio : user.bio,    
        pic: user.dp,
      });
      } else {
        res.render('wallet')
      }
    })
});

router.post('/profile/wallet', function(req, res, next){
    var username = req.user.username
    const type = req.body.type;
    const number = req.body.number;
    const date = req.body.date;
    const year = req.body.year;
    const cvv = req.body.cvv;
    var amount = req.body.amount;
    var card = {
        cardType: type,
        number: number,
        expiryMonth: date,
        expiryYear: year,
        cvv: cvv
    };
    console.log(amount)
    var validation = CreditCard.validate(card);
    console.log(validation)
    if (validation.validCardNumber == true && validation.isExpired == false){
        bank.findOne({username:username}, function(err, user){
            if (user){
                newBalance = user.amount + parseInt(amount);
                console.log(newBalance);
                bank.findOneAndUpdate({username:'donhitme34'},{ $set: { amount: newBalance }},function(err){
                  if(err){
                    console.log(err);
                    return;
                  } else {
                    alert('Sucessfully added money');
                    res.redirect('/profile');
                  }
                })
            }else{
              newBalance = new bank({
                username:username,
                number:number,
                date:date,
                year:year,
                amount:amount
              })
              newBalance.save(function(err){
                if(err){
                  console.log(err);
                  return;
                } 
                else {
                  res.redirect('/profile');
                  alert('Check your email for confirmation')
                }
              })
            }
        });
    }
});

router.get('/password',ensureAuthenticated, function(req, res, next){
    res.render('password', { title: 'password'})
})
router.post('/password',ensureAuthenticated, function(req, res, next){
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
  
    let errors = req.validationErrors();
  
    if(errors){
      res.render('password', {
        errors:errors
      });
    } else {
      query = {_id : req.user._id};
      let ppl = {}
      ppl.password = req.body.password
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(ppl.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          ppl.password = hash;
          User.findByIdAndUpdate(query,ppl,function(err){
            if(err){
              console.log(err);
              return;
            } else {
              req.flash('success','password update');
              res.redirect('/profile/'+req.user.username);
            }
        });   
      });
    });
  }
});
router.get('/settings',ensureAuthenticated, function(req, res, next){
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
          res.redirect('/profile/'+req.user.username);
        }
    });   
});
});

router.get('/bio',ensureAuthenticated, function(req, res, next){
    res.render('bio', { title: 'bio'})
});

router.post('/bio',ensureAuthenticated,(req, res) => {
  query = {_id : req.user._id};

  let about = {}
  about.bio = req.body.Bio;

  User.findByIdAndUpdate(query,about,function(err){
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success','bio update');
      res.redirect('/profile/' + req.user.username);
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