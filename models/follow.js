var mongoose = require('mongoose'),
Schema   = mongoose.Schema;

var FollowSchema = new Schema({

    follower: {
        type: String,
    },
    followee: {
        type: String,
    }

});

module.exports = mongoose.model('Follow', FollowSchema);