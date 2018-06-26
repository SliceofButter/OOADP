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
    passwordResetToken: String,
    passwordResetExpires: Date,
    username:{
        type:String,
        require :true,
    },
    bio: String,
    dp:String,
})    


const User = module.exports = mongoose.model('User', userSchema);