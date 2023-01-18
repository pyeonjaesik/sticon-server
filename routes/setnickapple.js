var atob = require('atob');

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};

var setnickapple = async function(req, res) {
  console.log('setnick_apple');
  var output={};
  var accessToken = req.body.token||0;
  var nick = req.body.nick||0; 
  var id_query='';
  var id_length=nick.length;
  for(var i=0;i<id_length;i++){
    if(i==id_length-1){
      id_query+=nick[i];
    }else{
      id_query+=nick[i]+' '

    }
  }
	var database = req.app.get('database');
	if (database.db) {
    var json= await parseJwt(accessToken);
    var user_id='a'+json.sub;
    database.UserModel.where({user_id}).update({'id':nick,id_query},function(err){
      if(err){
        console.log('djksfhfkjdshfkjd')
        console.log(err);
        console.log('setnick_kakao UserModel.update err');
        output.status=1003;
        res.send(output);
        return;
      }
      console.log('setnick success: '+nick);
      output.status=100;
      res.send(output);
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.setnickapple = setnickapple;