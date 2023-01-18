var crypto = require('crypto');

var Schema = {};

Schema.createSchema = function(mongoose) {
	
	// 스키마 정의
	var UserSchema = mongoose.Schema({
		user_id: {type: String,required: true, unique: true, 'default':'', index: 'hashed'},
		id: {type: String, required: true, 'default':''},
		uid: {type: String, required: true, 'default':''},
		id_query: {type: String, 'default':'', index: 'text'},
		pw: {type: String, 'default':'0'},
		salt: {type:String},
		pwindex:{type:Number,'default':0},
		pwct:{type:Number,'default':0},
		ct:{type:Number,'default':0},
		type:{type: Number},
		ph:{type:String},
		email:{type:String},
		age:{type: Number,'default':20},
		birthday:{type: Number,'default':0},
		gender:{type: Number,'default':1},
		itr:{type:Number,'default':0}, // instruction 0=> instruction 숙지 x
		img: {type: String, 'default':''},
		thumbnail: {type: String, 'default':''},
		video: {type: String, 'default':''},
		intro: {type: String, 'default':''},
		price: {type:Number,'default':0},
		connect:{
			on:false,
			time:0
		},
		instagram:{
			url:'',
			follow:0
		},
		youtube:{
			url:'',
			follow:0
		},
		africa:{
			url:'',
			follow:0
		},
		tiktok:{
			url:'',
			follow:0
		},
		vanhana:{
			url:'',
			follow:0
		},
		socket:{type: String, 'default':''},
	});
	// password를 virtual 메소드로 정의 : MongoDB에 저장되지 않는 편리한 속성임. 특정 속성을 지정하고 set, get 메소드를 정의함
	// UserSchema
	//   .virtual('password')
	//   .set(function(password) {
	//     this._password = password;
	//     this.salt = this.makeSalt();
	//     this.hashed_password = this.encryptPassword(password);
	//   })
	//   .get(function() { return this._password });
	
	// // 스키마에 모델 인스턴스에서 사용할 수 있는 메소드 추가
	// // 비밀번호 암호화 메소드
	// UserSchema.method('encryptPassword', function(plainText, inSalt) {
	// 	if (inSalt) {
	// 		return crypto.createHmac('sha1', inSalt).update(plainText).digest('hex');
	// 	} else {
	// 		return crypto.createHmac('sha1', this.salt).update(plainText).digest('hex');
	// 	}
	// });
	
	// // salt 값 만들기 메소드
	// UserSchema.method('makeSalt', function() {
	// 	return Math.round((new Date().valueOf() * Math.random())) + '';
	// });
	
	// // 인증 메소드 - 입력된 비밀번호와 비교 (true/false 리턴)
	// UserSchema.method('authenticate', function(plainText, inSalt, hashed_password) {
	// 	if (inSalt) {
			
	// 		return this.encryptPassword(plainText, inSalt) === hashed_password;
	// 	} else {
			
	// 		return this.encryptPassword(plainText) === this.hashed_password;
	// 	}
	// });
	
	// // 값이 유효한지 확인하는 함수 정의
	// var validatePresenceOf = function(value) {
	// 	return value && value.length;
	// };
		
	// // 저장 시의 트리거 함수 정의 (password 필드가 유효하지 않으면 에러 발생)
	// UserSchema.pre('save', function(next) {
	// 	if (!this.isNew) return next();
	
	// 	if (!validatePresenceOf(this.password)) {
	// 		next(new Error('유효하지 않은 password 필드입니다.'));
	// 	} else {
	// 		next();
	// 	}
	// })
	
	// // 필수 속성에 대한 유효성 확인 (길이값 체크)
	// UserSchema.path('id').validate(function (id) {
	// 	return id.length;
	// }, 'id 칼럼의 값이 없습니다.');
	
	// UserSchema.path('hashed_password').validate(function (hashed_password) {
	// 	return hashed_password.length;
	// }, 'hashed_password 칼럼의 값이 없습니다.');
	
	   
	// // 스키마에 static 메소드 추가
	// UserSchema.static('findById', function(id, callback) {
	// 	return this.find({id:id}, callback);
	// });
	
	// UserSchema.static('findAll', function(callback) {
	// 	return this.find({}, callback);
	// });
	
	return UserSchema;
};

// module.exports에 UserSchema 객체 직접 할당
module.exports = Schema;

