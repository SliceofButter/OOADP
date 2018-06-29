let mongoose = require('mongoose');


// Transaction Schema

const TransSchema = mongoose.Schema({
    uniqueID:{
        type: String,
        require: true,
    },
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
    status:{
        type: String,
        require: true,
    },
    buyer:{
        type: String,
        require: true,
    }
    // itemimageupload:{
    //     type:String,
    //     require:true,
    // },

})

const TransStore = module.exports = mongoose.model('Transac', TransSchema);