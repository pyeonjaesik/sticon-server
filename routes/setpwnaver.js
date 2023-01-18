const fetch = require('node-fetch');

var setpwnaver = function(req, res) {
  console.log('setpw_naver');
  var crypto = require('crypto');
  var output={};
  var accessToken = req.body.token||0;
  var PW = req.body.pw||0;
	var database = req.app.get('database');
	if (database.db) {
    fetch('https://openapi.naver.com/v1/nid/me', {
      method: 'get',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    .then(res => res.json())
    .then(async json => {
      var user_id='n'+json.response.id;
      var salt=Math.round((new Date().valueOf() * Math.random())) + '';
      var encryptPW=await crypto.createHmac('sha256', salt).update(PW).digest('hex');
      database.UserModel.update({user_id},{pw:encryptPW,salt,pwct:0,pwindex:0},function(err){
        if(err){
          console.log('setpw_kit UserModel.update err');
          output.status=1003;
          res.send(output);
          return;
        }
        output.status=100;
        res.send(output);
      });
    }); 
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.setpwnaver = setpwnaver;