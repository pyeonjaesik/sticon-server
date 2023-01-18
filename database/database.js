var mongoose = require('mongoose');

// database 객체에 db, schema, model 모두 추가
var database = {};

// 초기화를 위해 호출하는 함수
database.init = function(app, config) {
	
	
	connecto(app, config);
}

//데이터베이스에 연결하고 응답 객체의 속성으로 db 객체 추가
function connecto(app, config) {
	
	
	// 데이터베이스 연결 : config의 설정 사용
    mongoose.Promise = global.Promise;  // mongoose의 Promise 객체는 global의 Promise 객체 사용하도록 함
	mongoose.connect(config.db_url);
	database.db = mongoose.connection;
	
	database.db.on('error', console.error.bind(console, 'mongoose connection error.',config.db_url));	
	database.db.on('open', function () {
		
		// config에 등록된 스키마 및 모델 객체 생성
		createSchema(app, config);
		
	});
	database.db.on('disconnected', connecto);

}

// config에 정의된 스키마 및 모델 객체 생성
function createSchema(app, config) {
	var schemaLen = config.db_schemas.length;
	
	
	for (var i = 0; i < schemaLen; i++) {
		var curItem = config.db_schemas[i];
		
		// 모듈 파일에서 모듈 불러온 후 createSchema() 함수 호출하기
		var curSchema = require(curItem.file).createSchema(mongoose);
		
		
		// User 모델 정의
		var curModel = mongoose.model(curItem.collection, curSchema);
		
		
		// database 객체에 속성으로 추가
		database[curItem.schemaName] = curSchema;
		database[curItem.modelName] = curModel;
	}
	
	app.set('database', database);
	
}
 

// database 객체를 module.exports에 할당
module.exports = database;
///주의 return 값으로 database 하는거 아님!