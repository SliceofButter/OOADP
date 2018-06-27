const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const multer = require('multer');

mongoose.connect(config.database,{
  useMongoClient: true,
});
let db = mongoose.connection;

// Check connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

let User = require('./models/user');

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: false
}));

// Express Messages Middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});
/*//Image Config
app.use(multer({ 
  dest: './public/itempic',
  rename: function (req,res,fieldname, filename) {
    return filename;
  },
 }));*/
// Home route

app.get('/', function(req, res, next){
  User.findById(req.user, function(err, user){
    res.render('home', { title: 'home', user: user })
    //console.log(user)
  });
});

app.get('/test', function(req, res){
  res.render('test');
})

// Route Files

let users = require('./routes/users');
app.use('/', users);
let productusers = require('./routes/productusers');
app.use('/', productusers);
let transactions = require('./routes/transaction');
app.use('/',transactions);

// Start Server
app.listen(3000, function(){
  console.log('Server started on port 3000...');
});
