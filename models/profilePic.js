let mongoose = require('mongoose');

const profilePic = mongoose.Schema({
    _id: {
        type: String,
        require : true
    },
    username:{
        type:String,
        require :true,
    },
    dp:{
        type:String,
        require :true,
    }
}, { _id: false })



const profPic = module.exports = mongoose.model('profilePic', profilePic);