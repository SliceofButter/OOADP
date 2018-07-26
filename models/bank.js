let mongoose = require('mongoose');

const bankSchema = mongoose.Schema({
    username:{
        type:String,
        
    },
    cardType:{
        type:String,
        
    },
    number:{
        type: String,
        
    },
    date: { 
        type: String, 
        
    },
    year:{
        type: String,
        
    },
    amount:{
        type: Number,        
    },
    
})    


const Bank = module.exports = mongoose.model('Bank', bankSchema);