import React, { Component } from 'react';
import FAChevronDown from 'react-icons/lib/md/keyboard-arrow-down'
import FAMenu from 'react-icons/lib/fa/list-ul'
import FASearch from 'react-icons/lib/fa/search'
import MdEject from 'react-icons/lib/md/eject'  //some  react icons to make it look better

export default class SideBar extends Component{
	constructor(props){
		super(props)
		this.state = {
			reciever:""
		}
	}
	handleSubmit = (e) => {
		e.preventDefault() 
		const { reciever } = this.state
		const { onSendPrivateMessage } = this.props

		onSendPrivateMessage(reciever)
	}

	render(){
		const { chats, activeChat, user, setActiveChat, logout } = this.props //consts that youre getting out of this.props
		const { reciever } = this.state
		return (
			<div id="side-bar">
					<div className="heading">
						<div className="app-name">Your Chats<FAChevronDown /></div>
						<div className="menu">
							<FAMenu />
						</div>
					</div>
					<form onSubmit={this.handleSubmit} className="search">
						<i className="search-icon"><FASearch /></i>
						<input 
							placeholder="Add Chat or search for Other Users" 
							type="text"
							value={reciever}
							onChange={(e)=>{ this.setState({reciever:e.target.value}) }}/>
						<div className="plus"></div>
					</form>
					<div 
						className="users" 
						ref='users' //ref for onlick
						//if you click the box it sets the actibe chat to null
						onClick={(e)=>{ (e.target === this.refs.user) && setActiveChat(null) }}> 
						
						{
							//active chat starts
							
						chats.map((chat)=>{
							if(chat.name){
								// gets the last msg if there is one
								const lastMessage = chat.messages[chat.messages.length - 1];
								const chatSideName = chat.users.find((name)=>{ //find from list of users
									return name !== user.name
								}) || "Community"  // returns community if name not found
								const classNames = (activeChat && activeChat.id === chat.id) ? 'active' : '' //if activechat is not null and activechatid=chatid set active chat
								
								
								//return this if chat is found
								return(
								<div 
									key={chat.id} //children of react component need this in case there are more of the same kind of things 
									className={`user ${classNames}`} //classname that you set on top
									onClick={ ()=>{ setActiveChat(chat) } } // causes setactivechat to tse to the current chat we are on
									>
						
									<div className="user-photo">{chatSideName[0].toUpperCase()}</div> 
									<div className="user-info">
										<div className="name">{chatSideName}</div>
										{lastMessage && <div className="last-message">{lastMessage.message}</div>} 
									</div>
									
								</div>
							)
							}

							return null //if abv doesnt return properly
						})	
						}
						
					</div>
					<div className="current-user">
						<span>{user.name}</span>
						<div onClick={()=>{logout()}} title="Logout" className="logout">
							<MdEject/>	
						</div>
					</div>
			</div>
		);
	
	}
}
