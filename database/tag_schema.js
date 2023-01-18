var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var TagSchema = mongoose.Schema({
		id: {type: String, required: true, 'default':'',unique: true},
		id_query: {type: String, 'default':'', index: 'text'},
		num:{type:Number,default:0},
	});
	return TagSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

