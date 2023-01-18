var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var StickerSchema = mongoose.Schema({
		user_id: {type: String, required: true, 'default':''},
		text: {type: String, 'default':''},
		tag: {type: String, 'default':'', index: 'text'},
		type:{type:Number,default:0},
		clip:[],
		ct:{type:Number,default:0},
		show:{type:Number,default:0},
	});
	return StickerSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

