let mongoose = require( 'mongoose' );

const Commentst = mongoose.Schema({
    username : String,
    content  : String,
    created  : Date
    //to
    //from 
    // try to redirect to the same page 
})

   
 
//mongoose.model( 'Comment', Comment );
const Comments = module.exports = mongoose.model('Comment',Commentst);
// mongoose.connect( 'mongodb://localhost/commentsThing' );