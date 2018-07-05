let mongoose = require('mongoose');

const bankSchema = mongoose.Schema({
    username:{
        type:String,
        require :true,
    },
    number:{
        type: Number,
        require :true,
    },
    date: { 
        type: String, 
        require : true,
    },
    year:{
        type: String,
        require :true,
    },
    cvv:{
        type: Number,
        require :true,
    },
    amount:{
        type: Number,
        require :true,
    },
    
})    


const Bank = module.exports = mongoose.model('Bank', bankSchema);