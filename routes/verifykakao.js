const fetch = require('node-fetch');

var verifykakao = function(req, res) {
  console.log('verify_kit');
  var output={};
  var accessToken = req.body.accessToken||0;
  var _id = req.body._id; 
	var database = req.app.get('database');
	if (database.db) {
    fetch('https://kapi.kakao.com/v2/user/me', {
      method: 'get',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    .then(res => res.json())
    .then(json => {
      console.log(json);
      var user_id='k'+json.id;
      database.UserModel.find({_id},(err,results)=>{
        if(err){
          console.log('verfitkit UserModel.find err');
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length>0){
          if(results[0]._doc.user_id==user_id){
            console.log('verify kakao success');
            output.status=100;
            res.send(output);
          }else{
            console.log('verfit kakao failed2');
            output.status=200;
            res.send(output);
          }
        }else{
          console.log('verfitkit failed');
          output.status=200;
          res.send(output);
        }
      });
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.verifykakao = verifykakao;