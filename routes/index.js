

 
let Comment = require( '../models/db' );

exports.index = function ( req, res ){
  Comment.find( function ( err, comments, count ){
    res.render( 'index', {
        comments : comments
    });
  });
}; 

exports.create = function ( req, res ){
  new Comment({
    username : req.body.username,
    content : req.body.comment,
    created : Date.now()
  }).save( function( err, comment, count ){
    res.redirect( '/' );
  });
};