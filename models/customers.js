let mongoose = require('mongoose');


// Transaction Schema

const CustSchema = mongoose.Schema({
    username:{
        type: String,
        require: true,
    }
})

const TransStore = module.exports = mongoose.model('Cust', CustSchema);