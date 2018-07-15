let mongoose = require('mongoose');



const reportSchema = mongoose.Schema({
    reason:{
        type:String,
    },
    comment:{
        type:String
    },
    fromUser:{
        type:String
    },
    toUser:{
        type:String
    }
})

const reportsholder = module.exports = mongoose.model('userReport', reportSchema);