let mongoose = require('mongoose');

// item schema 

const wishlistSchema = mongoose.Schema({
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
    //this will throw the image into project files
    itemimageupload:{ 
        type: String,
        //data: Buffer,
        //contentType: String,
        require :true,
    },
    //this will upload to mongodb
    img:{
        data: Buffer,
        contentType: String,
    },
    itemcondition:{
        type:String,
        require:true,
    },
    uniqueID:{
        type: String,
        require: true,
    },
    status:{
        type: String,
        require: true,
    },
    buyer:{
        type: String,
        require: true,
    },
    category:{
        type: String,
        require: true,
    },
    wisher:{
        type: String,
        require: true,
    },
    id: {
        type:String,
        require:true
    }
})

const wishlistholder = module.exports = mongoose.model('Wishlists', wishlistSchema);