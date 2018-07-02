const uuidv4 = require('uuid/v4')

//returns an object that has an id, name 
// take the paramater of an object that has a string
const createUser = ({name = "", socketId = null } = {})=>( //function that takes in an object
	{
		id:uuidv4(), //allows you to have unique id for all the users
		name,
		socketId
		
	}
)

/*
*	createMessage
*	Creates a messages object.
* 	@prop id {string}
* 	@prop time {Date} the time in 24hr format i.e. 14:22
* 	@prop message {string} actual string message
* 	@prop sender {string} sender of the message
*	@param {object} 
*		message {string}
*		sender {string}
*/
const createMessage = ({message = "", sender = ""} = { })=>(
		{
			id:uuidv4(),
			time:getTime(new Date(Date.now())),
			message,
			sender	
		}

	)


//	createChat
//	Creates a Chat object

const createChat = ({messages = [], name = "Community", users = []} = {})=>( // if the user does not enter anything it will return original values
	{
		id:uuidv4(),
		name,
		messages,
		users,
		typingUsers:[]
	}
)



//returns a string represented in 24hr time i.e. '11:30', '19:30'

const getTime = (date)=>{
	return `${date.getHours()}:${("0"+date.getMinutes()).slice(-2)}`
}
//export so that it can display/send back
module.exports = {
	createMessage,
	createChat,
	createUser
}

