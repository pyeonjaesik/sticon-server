var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
	// 스키마 정의
	var FollowSchema = mongoose.Schema({
		socket:{type: String, 'default':''},
		request:[],
		follow:[],
		follower:{type:Number,'default':0},
		unfollow:[],
		block:[],
		group:[]
	});
	return FollowSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

