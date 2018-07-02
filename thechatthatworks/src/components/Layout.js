//frontend

import React, { Component } from 'react';
import io from 'socket.io-client'
import { USER_CONNECTED, LOGOUT } from '../Events'
import LoginForm from './LoginForm'
import ChatContainer from './chats/ChatContainer'
// import database from '../../controllers/database'

// var myDatabase = require('../controllers/database');
// var sequelize = myDatabase.sequelize;
// var Sequelize = myDatabase.Sequelize;

// const user = sequelize.define('user', {
    
//     user: {
//         type: Sequelize.STRING,
//         allowNull: false,
//         defaultValue: '',
//         trim: true
// 	}
// });

const socketUrl = "http://localhost:4200"
export default class Layout extends Component {
	
	constructor(props) {
	  super(props);
	
	  this.state = {
		  //initial states 
	  	socket:null,
	  	user:null
	  };
	}

	componentWillMount() {
		this.initSocket()
	}

	
	//Connect to and initializes the socket.
	
	initSocket = ()=>{
		  // which is why you need to import io 
		const socket = io(socketUrl)
      
		socket.on('connect', ()=>{
			console.log("Connected");
		})
		
		this.setState({socket})
	}

	
	// Sets the user property in state 
	// a user object that has an id and a name
	
	// this will be called ref loginforms
	//will be added to list of users
	setUser = (user)=>{
		//get socket from state
		const { socket } = this.state
		//broadcast to everyone/ send to server to add to the list of users logged in
		socket.emit(USER_CONNECTED, user);
		//set state to the user that was passed in
		this.setState({user})
	}

	logout = ()=>{
		// emit to the server that the user has logged out
		const { socket } = this.state
		socket.emit(LOGOUT)
		//set user state to null
		this.setState({user:null})

	}


	render() {
		const { title } = this.props
		const { socket, user } = this.state
		return (
			<div className="container">
				{
					!user ?	//if the user is null
					<LoginForm socket={socket} setUser={this.setUser} /> //take socket that it can use to emit to socket + set user function 
					: // if there is a user
					<ChatContainer socket={socket} user={user} logout={this.logout}/> 
				}
			</div>
		);
	}
}
