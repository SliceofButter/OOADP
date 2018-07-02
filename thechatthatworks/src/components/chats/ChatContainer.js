import React, { Component } from 'react';
import SideBar from './SideBar'
import { COMMUNITY_CHAT, MESSAGE_SENT, MESSAGE_RECIEVED, TYPING, PRIVATE_MESSAGE } from '../../Events'
import ChatHeading from './ChatHeading'
import Messages from '../messages/Messages'
import MessageInput from '../messages/MessageInput'

//set state of chats
export default class ChatContainer extends Component { //export to other js files
	constructor(props) {  //declare stuff here
	  super(props);	
	
	  this.state = {
	  	chats:[],
	  	activeChat:null
	  };
	}
// lifecycle method of react
	componentDidMount() {
		const { socket } = this.props //get socket
		this.initSocket(socket)
	}
// initialise the socket
	initSocket(socket){
		socket.emit(COMMUNITY_CHAT, this.resetChat) //emit chat 
		socket.on(PRIVATE_MESSAGE, this.addChat)
		socket.on('connect', ()=>{
			socket.emit(COMMUNITY_CHAT, this.resetChat)
		})
	}

	sendOpenPrivateMessage = (reciever) => {
		const { socket, user } = this.props
		socket.emit(PRIVATE_MESSAGE, {reciever, sender:user.name})
	}

	//eset the chat back to only the chat passed in.
	
	resetChat = (chat)=>{
		return this.addChat(chat, true)
	}

	
	//	Adds chat to the chat container, if reset is true removes all chats
    //	and sets that chat to the main chat.
	//	Sets the message and typing socket events for the chat.

	addChat = (chat, reset = false)=>{
		const { socket } = this.props  //gets socket
		const { chats } = this.state  //get states

		const newChats = reset ? [chat] : [...chats, chat] //reset or add chat adn if it is = thrn new - current
		this.setState({chats:newChats, activeChat:reset ? chat : this.state.activeChat}) //if youre resetting active chat set to chat if not no diff

		const messageEvent = `${MESSAGE_RECIEVED}-${chat.id}` //send a msg 
		const typingEvent = `${TYPING}-${chat.id}` 
// set event listeners
		socket.on(typingEvent, this.updateTypingInChat(chat.id)) //add event for calling the chat
		socket.on(messageEvent, this.addMessageToChat(chat.id))
	}

	//	Returns a function that will 
	// adds message to chat with the chatId passed in. 
	
	addMessageToChat = (chatId)=>{
		return message => {
			const { chats } = this.state //looks through the chat
			let newChats = chats.map((chat)=>{ //gets new chat from chats.map //looks through the chats to find chat w id   
				if(chat.id === chatId)
					chat.messages.push(message)
				return chat //all the chat gets into new chat
			})

			this.setState({chats:newChats}) //set state of new chat
		}
	}

	
	// Updates the typing of chat with id passed in.
	
	updateTypingInChat = (chatId) =>{
		return ({isTyping, user})=>{ //returns 2 functions
			if(user !== this.props.user.name){ //if user not = to user that just logged in

				const { chats } = this.state

				let newChats = chats.map((chat)=>{ 
					if(chat.id === chatId){ //check id of each chat
						if(isTyping && !chat.typingUsers.includes(user)){ //if the user that is typing is in the typing user array of the chat
							chat.typingUsers.push(user) 
						}else if(!isTyping && chat.typingUsers.includes(user)){ //if person not typing and inside array
							chat.typingUsers = chat.typingUsers.filter(u => u !== user) // filter out username 
						}
					}
					return chat 
				})
				this.setState({chats:newChats})
			}
		}
	}

	//	Adds a message to the specified chat
    // gets a chat id that you want to add
    //gets the msg that you want to send
	sendMessage = (chatId, message)=>{
		const { socket } = this.props //create a constant
		socket.emit(MESSAGE_SENT, {chatId, message} ) //emit to socket
	}

	//Sends typing status to server.
	//id of the person you want send it to
	//boolean if the person typing or not
	
	sendTyping = (chatId, isTyping)=>{
		const { socket } = this.props
		socket.emit(TYPING, {chatId, isTyping})
	}

	setActiveChat = (activeChat)=>{
		this.setState({activeChat}) //sets active chat to the null variable above
	}
	render() {
		const { user, logout } = this.props
		const { chats, activeChat } = this.state
		return (
			<div className="container">
				<SideBar
					logout={logout}
					chats={chats}
					user={user}
					activeChat={activeChat}
					setActiveChat={this.setActiveChat}
					onSendPrivateMessage={this.sendOpenPrivateMessage}
					/>
				<div className="chat-room-container">
					{
						activeChat !== null ? ( //if active chat is not = null

							<div className="chat-room">
								<ChatHeading name={activeChat.name} /> 
								<Messages 
									messages={activeChat.messages}
									user={user}
									typingUsers={activeChat.typingUsers}
									/>
								<MessageInput 
									sendMessage={ //fucntion
										(message)=>{ //take msg
											this.sendMessage(activeChat.id, message) //send to sendmsg
										}
									}
									sendTyping={
										(isTyping)=>{ //boolean
											this.sendTyping(activeChat.id, isTyping) //just a booleean
										}
									}
									/>

							</div>
						): //do this if above doesnt match
						<div className="chat-room choose">
							<h3>Choose a chat!</h3>
						</div>
					}
				</div>

			</div>
		);
	}
}
