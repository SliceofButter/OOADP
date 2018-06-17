let mongoose = require('mongoose');

// item schema 

const itemSchema = mongoose.Schema({
    itemname:{
        type: String,
        require :true,
    },
    itemprice:{
        type: Number,
        require :true,
    },
    username:{
        type:String,
        require :true,
    },
    description:{
        type: String,
        require :true,
    },
    img:{ 
        data: Buffer, contentType: String 
    },  
})

const ItemStore = module.exports = mongoose.model('Items', itemSchema);