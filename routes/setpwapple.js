var atob = require('atob');

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};
var setpwapple = async function(req, res) {
  console.log('setpw_apple');
  var crypto = require('crypto');
  var output={};
  var accessToken = req.body.token||0;
  var PW = req.body.pw||0;
	var database = req.app.get('database');
	if (database.db) {
    var json= await parseJwt(accessToken);
    var user_id='a'+json.sub;
    var salt=Math.round((new Date().valueOf() * Math.random())) + '';
    var encryptPW=await crypto.createHmac('sha256', salt).update(PW).digest('hex');
    database.UserModel.update({user_id},{pw:encryptPW,salt,pwct:0,pwindex:0},function(err){
      if(err){
        console.log('setpw_kakao UserModel.update err');
        output.status=1003;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.setpwapple = setpwapple;