let mongoose = require('mongoose');

//ADDRESS SCHEMA

const addrSchema = mongoose.Schema({
    username:{
        type:String
    },
    name:{
        type: String,
        require: true
    },
    addr1:{
        type: String,
        require: true
    },
    addr2:{
        type:String
    }
    ,
    unit:{
        type: String,
        require: true
    },
    code:
    {
        type:String,
        require:true
    }

})

const address = module.exports = mongoose.model('Address',addrSchema)