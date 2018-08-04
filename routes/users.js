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
let Bank = require('../models/bank');
let Transacs = require('../models/transaction');
let Follow = require('../models/follow');
let ReportUser = require('../models/reportuser')
let Address = require('../models/address');
let Comment1 = require('../models/db')

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
    if (user){
      req.flash('danger','The email address you have entered is already associated with another account.');  
      res.redirect('/register');
    } 
    // Create and save the user
    let newUser = new User({ 
      name:name,
      email:email,
      username:username,
      password:password
    });
    let newAddress = new Address();{
      newAddress.username = username
    }
    newAddress.save(function(err,add)
  {
    
  })

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
              var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port:465, secure:true, tls:{ rejectUnauthorized: false}, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
              var mailOptions = { from: 'sghawt@gmail.com', to: newUser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + token.token + '.\n' };
              transporter.sendMail(mailOptions, function (err) {
                  if (err) {console.log(err) }
                  res.render('registration',{
                    email:newUser.email
                  })
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
      res.redirect("/passwordconfirm")
      })    
  });
})
})

router.get('/passwordconfirm',(req,res)=>{
  res.render('passwordconfirm')
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
        var mailOptions = { from: 'sghawt@gmail.com', to: user.email, subject: 'Password Reseted', text: 'Hello,\n\n' + 'Here is your new password ' + passwordgen};
        transporter.sendMail(mailOptions, function (err) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        
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
            res.render("confirm-email");
        });
    });
});
});
// Login Form
router.get('/login', function(req, res){
  res.render('login',);
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: 'Invalid username or password.'
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



router.post('/profile/:username', function(req,res){
  const f = req.body.follow1;
  const r = req.body.reporting;
  if(f)
  {
    console.log('Testing')
    let following = new Follow()
    following.follower   = req.user.username
    following.following = req.params.username
    following.save(function (err) {
      if(err){
        console.log(err)
      } else {
        res.redirect('/');
        alert('Followed')
      }
    })
  }else if(r){
    const reason = req.body.report;
    const comment = req.body.comment;
    newReport = new ReportUser({
      reason:reason,
      comment:comment,
      fromUser:req.user.username,
      toUser:req.params.username
    })
    
    newReport.save(function(err){
      if(err){
        console.log(err);
        return;
      } 
      else {
        res.redirect('/');
        alert('lol')
      }
    })
  }
});


router.get('/profile/:username',ensureAuthenticated, function(req, res, next){
  User.findOne({username:req.params.username}, function(err, current){
    User.findOne({username:req.user.username},function(err, user){
      console.log(user)
    Items.find({username:user.username},function(err, data){      
        Bank.findOne({username:req.user.username}, function(err, bank){
        // console.log(follow)
        //console.log(offer);
        // User.findOne({username:req.params.username}, function(err, user1){
        //   if (err) return res.json(err);
        //   return res.json(user);
        // }).populate([
        //   { path: 'following' },
        //   { path: 'followers' }
        // ])
        if (user.dp != null && user.bio !=null){
          res.render('profile', {
          current: current.username,
          bio : user.bio,    
          pic : user.dp,
          data : data,
          // follow : follow.following,
          wallet : bank,
          user:user
        });
        } else {
          res.render('profile',{
          current: current.username,
          bio : user.bio,    
          pic : user.dp,
          data : data,            
          wallet : bank,     
          })
        }
        })
      })
    })
  // }).populate(['following','follower'])
  })
})

router.get('/profile/:username/wallet',ensureAuthenticated, function(req, res, next){
User.findOne({username:req.params.username}, function(err, current){
  User.findOne({username:req.user.username},function(err, user){  
  Bank.findOne({username:user.username},function(err,bank){
    console.log(user)
    if (user.dp != null && user.bio !=null && bank != null && bank.number !=null){
      var str = bank.number
      var shit = str.toString().slice(14,16);
      // console.log(bank)
      res.render('wallet', {
      current: current.username,
      bio : user.bio,    
      pic: user.dp,
      wallet : bank,
      bank :bank.number, 
      shit : shit,
      user:user
    });
    } else {
      res.render('wallet',{
        current: current.username,
        bio : user.bio,    
        pic: user.dp,
        wallet : bank,
        user : user,
        shit : shit,    
      })
    }
  })
   })
  })
});

router.get('/profile/:username/addfunds',ensureAuthenticated, function(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    Bank.findOne({username:user.username},function(err,bank){
    // console.log(user)
    var str = bank.number
    var shit = str.toString().slice(14,16);
    var lol = 6;
    var lol1 = 12;
    var lol2 = 30;
    var lol3 = 60;
    var lol4 = 120;
    jwt.sign({data: lol}, 'secret', { expiresIn: '1h' },function(err,token){
      jwt.sign({data: lol1}, 'secret', { expiresIn: '1h' },function(err,token1){
        jwt.sign({data: lol2}, 'secret', { expiresIn: '1h' },function(err,token2){
          jwt.sign({data: lol3}, 'secret', { expiresIn: '1h' },function(err,token3){
            jwt.sign({data: lol4}, 'secret', { expiresIn: '1h' },function(err,token4){
            res.render('addfunds',{
              current:user.username,
              token:token,
              token1:token1,
              token2:token2,
              token3:token3,
              token4:token4,
              shit:shit
            })
            })
            })
          })
        })
      })
    })
  })
})

router.get('/profile/:username/addfunds/:id',ensureAuthenticated, function(req, res, next){
  var token = req.params.id;
  User.findOne({username:req.params.username}, function(err, user){
    Bank.findOne({username:user.username},function(err,bank){
      // console.log(user)
      var str = bank.number
      var shit = str.toString().slice(14,16);
      jwt.verify(token, 'secret', function (err, decoded){
        console.log(decoded)
        res.render('confirmfund',{
          decoded:decoded.data,
          shit:shit,
          token:token,
          current:user.username
        })
      })
    })
  })
})

router.post('/profile/:username/addfunds/:id',ensureAuthenticated, function(req, res, next){
  var token = req.params.id;  
  User.findOne({username:req.params.username}, function(err, user){
    Bank.findOne({username:user.username},function(err,bank){
    jwt.verify(token, 'secret', function (err, decoded){
    const type = bank.cardType;  
    const number = bank.number;
    const date = bank.date;
    const year = bank.year;
    const cvv = req.body.cvv
      // console.log(user)
    var card = {
      cardType:type,
      number: number,
      expiryMonth: date,
      expiryYear: year,
      cvv: cvv
    };
    var validation = CreditCard.validate(card);
    console.log(validation)
    newBalance = bank.amount + decoded.data;
    console.log(newBalance)
    if (validation.validCardNumber == true && validation.isExpired == false){
      Bank.findOneAndUpdate({username:user.username},{ $set: { amount:newBalance }},function(err){
        if(err){
          console.log(err);
          return;
        } else{
        alert('You have added funds');
          res.redirect('/profile/'+user.username);
        }
      })
      
    }
      })
    })
  })
})

router.get('/profile/:username/wallet/edit',ensureAuthenticated, function(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    Bank.findOne({username:user.username},function(err,bank){
      if (user.dp != null && user.bio !=null && bank != null){
        var str = bank.number
        var shit = str.toString().slice(14,16);
        console.log(shit)
        res.render('editWallet', {
        current: user.username,
        bio : user.bio,    
        pic: user.dp,
        wallet : bank, 
        shit : shit
        
      });
      } else {
        var str = bank.number
        var shit = str.toString().slice(14,16);
        res.render('editWallet',{
          current: user.username,
          bio : user.bio,    
          pic: user.dp,
          wallet : bank,
          
        })
      }
     })
    })
  });

router.post('/profile/:username/wallet/edit',ensureAuthenticated, function(req, res, next){
  User.findOne({username:req.params.username}, function(err, current){
  var username = req.user.username
  const type = req.body.type;
  const number = req.body.number;
  const date = req.body.date;
  const year = req.body.year;
  const cvv = req.body.cvv;
  var card = {
      cardType : type,
      number: number,
      expiryMonth: date,
      expiryYear: year,
      cvv: cvv
  };
  var validation = CreditCard.validate(card);
  console.log(validation)
  if (validation.validCardNumber == true && validation.isExpired == false){
    Bank.findOne({username:username}, function(err, user){
      Bank.findOneAndUpdate({username:current.username},{ $set: { cardType : type, number: number, date:date, year:year }},function(err){
        if(err){
          console.log(err);
          return;
        } else{
        alert('Sucessfully change card');
          res.redirect('/profile/'+user.username);
        }
      })
    })
  }
  })
});
router.post('/profile/:username/wallet', function(req, res, next){
User.findOne({username:req.params.username}, function(err, current){
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
    Bank.findOne({username:current.username}, function(err, user){
      if(user == null){      
        console.log(user)
        newBalance = new Bank({
          cardType : type,
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
            var transporter = nodemailer.createTransport({ host: 'smtp.gmail.com', port:465, secure:true, auth: { user: 'sghawt@gmail.com', pass: 'NYPIT1704' } });
              var mailOptions = { from: 'sghawt@gmail.com', to: req.user.email, subject: 'You have successfully added funds to your Wallet', text: 'Hello ' + req.user.username+ '\n\n' + '$'+ amount + '.00 has been added to your account'};
              transporter.sendMail(mailOptions, function (err) {
                  if (err) { 
                    return res.status(500).send({ msg: err.message }); 
                  }
                })
            alert("Check your email for confirmation.");    
            res.redirect('/profile/'+current.username);
      
          }
        })
      
      }else if(user.number == null){
        query = {username : req.params.username};
          let ppl = {}
          ppl.cardType = type
          ppl.number = number
          ppl.date = date
          ppl.year = year
          Bank.findOneAndUpdate(query,{ $set: ppl},function(err){
              if(err){
              console.log(err);
              return;
              } else {
              req.flash('success','Updated');
              res.redirect('/profile/'+current.username);
              }
          });
            
          
      }             
    });
  } else{
    alert('You have entered the wrong credentials')
  }
})
});

router.get('/password',ensureAuthenticated, function(req, res, next){
  Bank.findOne({username:req.user.username}, function(err, bank){
    console.log(bank)
    res.render('password', { 
      title: 'password',
      wallet : bank,
    })
    })
  
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
  Bank.findOne({username:req.user.username}, function(err, bank){
    console.log(bank)
    res.render('editProfile', {
        title: 'settings',
        wallet : bank,
        })
    })
  
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
        req.flash('success','Profile pic updated');
        res.redirect('/profile/'+req.user.username);
      }
  });   
});
});

router.get('/bio',ensureAuthenticated, function(req, res, next){
  Bank.findOne({username:req.user.username}, function(err, bank){
    console.log(bank)
    res.render('bio', {
        title: 'bio',
        wallet : bank,
    })
    
  })
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

router.get('/address', ensureAuthenticated,(req, res) => {
  Bank.findOne({username:req.user.username}, function(err, bank){
    console.log(bank)
    res.render('address', {
        title: 'Address',
        wallet : bank,
    })
    
  })
})
router.post('/address', ensureAuthenticated, (req,res) => {
  User.findById(req.user, function(err, user){
    var submit = req.body.Submit1;

    var name = req.body.name;
    var addr1 = req.body.addr1;
    var  addr2 = req.body.addr2;
    var  unit = req.body.unit;
    var  code = req.body.code;

    if(submit)
    {
      Address.findOneAndUpdate({username:user.username},{ $set: { name : name, addr1: addr1, addr2:addr2, unit:unit, code:code}},function(err){
      
          req.flash('success','Address updated');
          res.redirect('/profile/' + req.user.username);
    })

  }
})
})

router.get('/profile/:username/comments', ensureAuthenticated,(req,res) =>{
  User.findOne({username:req.params.username}, function(err, current){
    User.findOne({username:req.user.username},function(err, user){  
    Bank.findOne({username:user.username},function(err,bank){
    Comment1.find({username:user.username}, function(err,comments){
      comments.forEach(function(test){
  console.log(test.username)
  console.log(test.content)
})
  res.render('comments', {
    current: current.username,
    bio : user.bio,    
    pic : user.dp,           
    wallet : bank, 
    comments:comments 
  })
  
})
    })
    })
  })

})

router.post('/profile/:username/comments',ensureAuthenticated,(req,res) =>{
  User.findOne({username:req.user.username},function(err, user){  
  let Comments = new Comment1()
    Comments.username = user.username,
    Comments.content = req.body.comment,
    Comments.created = Date.now()
    Comments.save( function( err, comment, count ){
    res.redirect( '/' );
    })
  })
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