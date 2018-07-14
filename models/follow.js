var mongoose = require('mongoose'),
Schema   = mongoose.Schema;

var FollowSchema = new Schema({

    follower: {
        type: String,
        ref: 'User'
    },
    following: {
        type: String,
        ref: 'User'
    }

});

module.exports = mongoose.model('Follow', FollowSchema);