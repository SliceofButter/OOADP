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
const http = require('http');
var methodOverride = require('method-override');
const MongoDBStore = require('connect-mongodb-session')(session);



mongoose.connect(config.database,{
  useMongoClient: true,
});

var store = new MongoDBStore({
  uri: config.database,
  collection: 'users'
});

store.on('connected', function() {
  store.client; 
});
 

store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
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
let Bank = require('./models/bank');
let DB = require( './models/db' );
// Init App
const app = express();
app.use(methodOverride('_method'));
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
	store: store,
  resave: true,
  saveUninitialized: true,
}));

// Express Messages Middleware
app.use(require('connect-flash')());
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
  if(req.user){
  User.findById(req.user, function(err, user){
    Bank.findOne({username:user.username},function(err,bank){
      res.render('home', { title: 'home', user: user, wallet : bank })
    })
    //console.log(user)
  });
}else{
  res.render('home', { title: 'home'})
}
});

app.get('/test', function(req, res){
  res.render('test');
})

app.get('/payment', function(req, res){
  res.render('payment');
})

app.get('/chat',function(req, res){
  User.findById(req.user, function(err, user){
  Bank.findOne({username:user.username},function(err,bank){
  res.render('chat', {wallet:bank});//
  });
});
});

app.get('/about', function(req,res)
{
  res.render('about');
})
  
// Route Files

let users = require('./routes/users');
app.use('/', users);
let productusers = require('./routes/productusers');
app.use('/', productusers);
let transactions = require('./routes/transaction');
app.use('/',transactions);
let admins = require('./routes/admin');
app.use('/', admins)


// let admins = require('./routes/admin')
// app.use('/', admins);
// app.get('/admin',function(req,res){
//   res.render('admin')
// });
// var path = require('path');
// var express= require('express'),
	//app=express(),
	server = require('http').createServer(app),
	io=require('socket.io').listen(server),
    //mongoose = require('mongoose'),
	users123={};

	let ChatModel = require('./models/chat.js')
	

	io.on('connection',function(socket){
		console.log('new connection done');
		
		ChatModel.find({}, function(err, docs){
			if(err)throw err;
			console.log('sending old msgs');
			io.emit('load old msgs', docs);
		});//if the schema is found then console log this msg, emit the docs

		socket.on('send message',function(data){
			//saved in mongodb like this
			var newMsg = new ChatModel({msg:data.msg,sender: data.sender, reciever: data.reciever,nickname:socket.nickname});
		//	console.log(data.msg)
			newMsg.save(function(err){
			if(err){
			throw err;
			}else{
			io.emit('new message',{msg:data.msg,sender: data.sender, reciever: data.reciever,nickname:socket.nickname});
			}
			});			
		});

		socket.on('new user',function(data, callback){
			console.log('new user added: '+data);
			if(data in users123){
			callback(false);
			}
			else{
			callback(true);
			socket.nickname = data;
			users123[socket.nickname]=socket;
			updateNicknames();//calling the update nickname function from below
			}
		});
		
		
		socket.on('disconnect', function(data){
			if(!socket.nickname) return;
			delete users123[socket.nickname];
			updateNicknames();
		});
		
		function updateNicknames(){
		io.emit('usernames',Object.keys(users123));
		}
  })
app.use(function(req, res, next) {
  if(req.accepts('html') && res.status(404)) {
    Bank.findOne({username:req.user.username}, function(err, bank){
      res.render('errors', {wallet:bank});
      return;
    });
  }
});
// Start Server
server.listen(3000, function(){
  console.log('Server started on port 3000...');
});
