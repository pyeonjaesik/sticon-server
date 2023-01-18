var atob = require('atob');

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};
var verifyapple = async function(req, res) {
  console.log('verify_kit');
  var output={};
  var accessToken = req.body.accessToken||0;
  var _id = req.body._id; 
	var database = req.app.get('database');
	if (database.db) {
    var json= await parseJwt(accessToken);
    var user_id='a'+json.sub;
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
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.verifyapple = verifyapple;