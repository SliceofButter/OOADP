let mongoose = require('mongoose');

// User schema 

const userSchema = mongoose.Schema({
    name:{
        type: String,
        require :true,
    },
    email:{
        type: String,
        require :true,
    },
    isVerified: { 
        type: Boolean, 
        default: false
    },
    password:{
        type: String,
        require :true,
    },    
    username:{
        type:String,
        require :true,
    },
    bio: String,
    dp:String,
    isAdmin:{
        type: Boolean, 
        default: false
    },    
})    


const User = module.exports = mongoose.model('User', userSchema);