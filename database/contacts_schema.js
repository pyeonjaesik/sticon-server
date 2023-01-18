var Schema = {};

Schema.createSchema = function(mongoose) {
	// 스키마 정의
	var ContactsSchema = mongoose.Schema({
		contacts:[],
	});
	return ContactsSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

