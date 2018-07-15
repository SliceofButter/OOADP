var path = require('path');
var express= require('express'),
	app=express(),
	server = require('http').createServer(app),
	io=require('socket.io').listen(server),
    mongoose = require('mongoose'),
	users={};

	// server.listen(3000, function(){
	//   console.log('listening on *:3000');
	// });
	

	

	// var mongoose = require("mongoose")

	// mongoose.connect('mongodb://localhost/chatapp' , function(err){  // mongoose will auto create the db
	// 	  if(err){ //
	// 	 console.log(err);
	// 	} else
	// 	 {
	// 			console.log('connected to mongodb');
	// 	} 

// 		// Check connection
//  	db.once('open', function(){
// 		console.log('Connected to MongoDB');
//   	});
  
//   // Check for DB errors
//   	db.on('error', function(err){
// 		console.log(err);
//   	});
	
	// var chatSchema = mongoose.Schema({
	// 	sender: String,
	// 	nickname: String,
	// 	reciever: String,
	// 	msg: String,
	// 	created: {type: Date, default: Date.now}
	// });
	
	// var ChatModel = mongoose.model('Message',chatSchema);
	

	// app.set('views', path.join(__dirname, 'views'));
	// app.set('view engine', 'pug');

	app.get('/',function(req, res){
		res.render('chat');//
		});

	// app.get('/',function(req, res){
	// 	res.sendFile(__dirname+'/views/index.pug');
	// 	});

	io.on('connection',function(socket){
		console.log('new connection done');
		
		ChatModel.find({}, function(err, docs){
			if(err)throw err;
			console.log('sending old msgs');
			io.emit('load old msgs', docs);
		});

		socket.on('send message',function(data){
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
			if(data in users){
			callback(false);
			}
			else{
			callback(true);
			socket.nickname = data;
			users[socket.nickname]=socket;
			updateNicknames();
			}
		});
		// socket.on('picked color',function(data){
		// 	io.emit('new color',{color:data,nickname: socket.nickname});
		// });
		
		socket.on('disconnect', function(data){
			if(!socket.nickname) return;
			delete users[socket.nickname];
			updateNicknames();
		});
		
		function updateNicknames(){
		io.emit('usernames',Object.keys(users));
		}
	})
