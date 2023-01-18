var setpw = async function(req, res) {
  console.log('setpw');
  var crypto = require('crypto');
  var output={};
  var _id = req.body._id||0;
  var PW = req.body.pw||0;
  console.log('PW'+PW);
	var database = req.app.get('database');
	if (database.db) {
    var salt=Math.round((new Date().valueOf() * Math.random())) + '';
    var encryptPW=await crypto.createHmac('sha256', salt).update(PW).digest('hex');
    database.UserModel.update({_id},{pw:encryptPW,salt,pwct:0,pwindex:0},function(err){
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
module.exports.setpw = setpw;