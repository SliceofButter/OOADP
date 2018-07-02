import React, { Component } from 'react';

export default class MessageInput extends Component {
	
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	message:"",
	  	isTyping:false
	  };

	}
	
	handleSubmit = (e)=>{
		e.preventDefault() //do your own submit
		this.sendMessage()
		this.setState({message:""})
	}

	sendMessage = ()=>{
		this.props.sendMessage(this.state.message) //takes the msg argument

	}

	componentWillUnmount() {
	  this.stopCheckingTyping()
	}

	sendTyping = ()=>{
		this.lastUpdateTime = Date.now() //set to date when they start typimg
		if(!this.state.isTyping){ //so if user not typing
			this.setState({isTyping:true}) //set syate to is typing
			this.props.sendTyping(true) //from chat container
			this.startCheckingTyping() // method that checls if user is still typing
		}
	}

	
	// Start an interval that checks if the user is typing.
	
	startCheckingTyping = ()=>{
		console.log("Typing");
		this.typingInterval = setInterval(()=>{ //cont to keep id so that you can clear it later
			if((Date.now() - this.lastUpdateTime) > 300){ //check if user is typing every 300 ms stop if they havent been typing for 300 ms
				this.setState({isTyping:false})
				this.stopCheckingTyping()
			}
		})
	}
	//checks every 300ms
	stopCheckingTyping = ()=>{
		console.log("Stop Typing");
		if(this.typingInterval){ //check if have interval in the firdt place
			clearInterval(this.typingInterval) //clear typing
			this.props.sendTyping(false) //cuz user not typing anymore
		}
	}


	render() {
		const { message } = this.state
		return (
			<div className="message-input">
				<form 
					onSubmit={ this.handleSubmit }
					className="message-form">

					<input 
						id = "message"
						ref = {"messageinput"}
						type = "text"
						className = "form-control"
						value = { message } //msg from state
						autoComplete = {'off'}
						placeholder = "Type something interesting"
						onKeyUp = { e => { e.keyCode !== 13 && this.sendTyping() } } //if user is pressing key and the key is not enter buttom send "is typing" noti
						onChange = {
							({target})=>{ //take event
								this.setState({message:target.value}) //changes value
							}
						}
						/>
					<button
						disabled = { message.length < 1 } 
						type = "submit"
						className = "send"

					> Send </button>
				</form>

			</div>
		);
	}
}

