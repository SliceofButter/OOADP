let mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    sender: String,
    nickname: String,
    reciever: String,
    msg: String,
    created: {type: Date, default: Date.now}
});

// var ChatModel = mongoose.model('Message',chatSchema);
const ChatModel = module.exports = mongoose.model('Message',chatSchema);
// 