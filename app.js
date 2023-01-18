var express = require('express')
  , http = require('http')
  , path = require('path');
var helmet = require('helmet')
const spdy = require('spdy');
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');
const Guid = require('guid');
const Mustache  = require('mustache');
const Request  = require('request');
const Querystring  = require('querystring');
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');
var cors = require('cors');
var config = require('./config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');
var fs = require('fs');
var app = express();
app.set('port', 80);
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use('/uploads_p', static(path.join(__dirname, 'uploads_p')));
app.use('/dist', static(path.join(__dirname, 'dist')));
app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));
app.use(cors());

function exdev() {
  return fs.readFileSync('dist/exchange.html').toString();
}
app.get('/exdev', function(request, response){
  // var user_id=request.query.user_id;
  var view = {
    // user_id:user_id
  };    
  var html = Mustache.to_html(exdev(),view);
  response.send(html);
});
function qna() {
  return fs.readFileSync('dist/qna.html').toString();
}
app.get('/qna', function(request, response){
  // var user_id=request.query.user_id;
  var view = {
    // user_id:user_id
  };    
  var html = Mustache.to_html(qna(),view);
  response.send(html);
});
function userinfo() {
  return fs.readFileSync('dist/userinfo.html').toString();
}
function userinfo2() {
  return fs.readFileSync('dist/userinfo2.html').toString();
}
function userinfo3() {
  return fs.readFileSync('dist/userinfo3.html').toString();
}
function userex() {
  return fs.readFileSync('dist/userex.html').toString();
}
function pay() {
  return fs.readFileSync('dist/pay.html').toString();
}
function invite() {
  return fs.readFileSync('dist/invite.html').toString();
}

app.get('/userinfo', function(request, response){
  console.log('userinfo');
  var view = {
  };    
  var html = Mustache.to_html(userinfo(),view);
  response.send(html);
});

app.get('/userinfo2', function(request, response){
  var view = {
  };    
  var html = Mustache.to_html(userinfo2(),view);
  response.send(html);
});
app.get('/userinfo3', function(request, response){
  var view = {
  };    
  var html = Mustache.to_html(userinfo3(),view);
  response.send(html);
});
app.get('/elbcheck', function(request, response){
  console.log('elbcheck')
  response.send(200);
});
app.get('/userex', function(request, response){
  var view = {
    userid:request.query.userid
  };    
  var html = Mustache.to_html(userex(),view);
  response.send(html);
});
app.get('/invite', async function(request, response){
  console.log(request.query.group);
  const find_group= await database.GroupModel.find({_id:request.query.group});
  if(find_group.errors||find_group.length!=1){
    console.log('invite find group error');
    return;
  }
  const [id,img]=[find_group[0]._doc.id,find_group[0]._doc.img];
  console.log(img);
  const user_id_arr=find_group[0]._doc.members.map(em=>em.user_id);
  const find_users = await database.UserModel.find({user_id:{$in:user_id_arr}});
  if(find_users.errors){
    console.log('invite: find_users error');
    return;
  }
  let list='';
  find_users.map((em,index)=>{
    if(index===0){
      list+=em._doc.id+' ';
    }else{
      list+=','+em._doc.id;
    }
  })
  var view = {
    id,
    list,
    img
    // userid:request.query.userid
  };    
  var html = Mustache.to_html(invite(),view);
  response.send(html);
});
function usersearch() {
  return fs.readFileSync('dist/usersearch.html').toString();
}
app.get('/usersearch', function(request, response){
  var view = {
  };    
  var html = Mustache.to_html(usersearch(),view);
  response.send(html);
});
app.get('/pay', function(request, response){
  var userid=request.query.userid;
  var view = {
    user_id:'111'
  };    
  var html = Mustache.to_html(pay(),view);
  response.send(html);
});


var uploadprofileimg= require('./uploads/uploadprofileimg');
uploadprofileimg(app);

var uploadprofilevideo= require('./uploads/uploadprofilevideo');
uploadprofilevideo(app);

var uploadpost= require('./uploads/uploadpost');
uploadpost(app);

var uploadvideo= require('./uploads/uploadvideo');
uploadvideo(app);

var uploadvideo141= require('./uploads/uploadvideo141');
uploadvideo141(app);

var uploadgallery= require('./uploads/uploadgallery');
uploadgallery(app);

var uploadmscp= require('./uploads/uploadmscp');
uploadmscp(app);

var makegroup= require('./uploads/makegroup');
makegroup(app);

var uploadgroupimg= require('./uploads/uploadgroupimg');
uploadgroupimg(app);

var makesticker= require('./uploads/makesticker');
makesticker(app);


route_loader.init(app, express.Router());
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

///
//const options = {
//  key: fs.readFileSync('/etc/letsencrypt/live/www.yomencity.xyz/privkey.pem'),
//  cert:  fs.readFileSync('/etc/letsencrypt/live/www.yomencity.xyz/cert.pem')
//};
//spdy
//  .createServer(options, app)
//  .listen(8443, (err) => {
//    if (err) {
//      throw new Error(err);
//    }
//    database.init(app, config);
//    console.log('Listening on port: ' + 8443 + '.');
//  });
// var server = require('http').Server(app);

// Express 서버 시작
var admin = require("firebase-admin");

var serviceAccount = require("./path/puppy-9e6f3-firebase-adminsdk-7okuo-c4a804bfd6.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://puppy-9e6f3.firebaseio.com"
});

var server=http.createServer(app).listen(app.get('port'), async function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    await database.init(app, config);
    //autosticker

});
var socketinit= require('./chat/socketinit');
socketinit(server,database,app);
var autosticker=require('./auto/autosticker');
setTimeout(function(){
  autosticker(app)
},1000);

// var io = require('socket.io')(server);


// io.on('connection', function (socket) {
//   // socket.emit('USER_LIST', { users: [{id: 1, name: 'A'},{id: 2, name: 'B'}] });
//   socket.on('login', function (data) {
// 		// var clientInfo = new Object();
// 		// clientInfo.uid = data.uid;
// 		// clientInfo.id = socket.id;
//     console.log(`${socket.id}`)
//     io.to(socket.id).emit('CHAT',{data:'hi'});
//   });
// });