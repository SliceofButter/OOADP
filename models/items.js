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
    itemimageupload:{ 
        type: String,
        //data: Buffer,
        //contentType: String,
        require :true,
    },
    _id: {
        ObjectID:{
            type: String,
            require : true,
        },
    },
})

const ItemStore = module.exports = mongoose.model('Items', itemSchema);