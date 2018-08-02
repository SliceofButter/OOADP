let mongoose = require( 'mongoose' );

const Comment = mongoose.Schema({
    username : String,
    content  : String,
    created  : Date
})

   
 
//mongoose.model( 'Comment', Comment );
const Comment  = module.exports = mongoose.model('Comment', Comment);
 
// mongoose.connect( 'mongodb://localhost/commentsThing' );