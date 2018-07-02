//frontend
import React, { Component } from 'react';
import { VERIFY_USER } from '../Events'

export default class LoginForm extends Component {
	constructor(props) {
	  super(props);
	
	  this.state = {
	  	nickname:"",
	  	error:""
	  };
	}
// object that has user and isuser prop
// socket.io server sends objects 
// isuser is a boolean if its true set error
	setUser = ({user, isUser})=>{

		if(isUser){
			this.setError("User name taken")
		}else{
			this.setError("")
			this.props.setUser(user)// if its false the set user function from layout.js will be called w the user inside
		}
	}

	handleSubmit = (e)=>{
		e.preventDefault() //so it doesnt submit anything to server
		const { socket } = this.props //get socket from probs
		const { nickname } = this.state // get nikname from states
		socket.emit(VERIFY_USER, nickname, this.setUser) //emit listed stuff to server / verifyuser will take the followinf items listed
	}
//refer to codes below
//this handles the portion that changes
	handleChange = (e)=>{
		this.setState({nickname:e.target.value}) //changes nickname
	}

	setError = (error)=>{
		this.setState({error}) //= new error thats passed in
	}

	render() {	
		const { nickname, error } = this.state
		return (
			<div className="login">
				<form onSubmit={this.handleSubmit} className="login-form" >

					<label htmlFor="nickname">
						<h2>Enter a username to begin</h2>
					</label>
					<input
						ref={(input)=>{ this.textInput = input }} 
						type="text"
						id="nickname"
						value={nickname}
						onChange={this.handleChange}
						placeholder={'Username123'}
						/>
						<div className="error">{error ? error:null}</div>

				</form>
			</div>
		);
	}
}

