const fetch = require('node-fetch');

var setnicknaver = function(req, res) {
  console.log('setnick_naver');
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
  console.log(accessToken)
	var database = req.app.get('database');
	if (database.db) {
    fetch('https://openapi.naver.com/v1/nid/me', {
      method: 'get',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      var user_id='n'+json.response.id;
      database.UserModel.where({user_id}).update({'id':nick,id_query},function(err){
        if(err){
          console.log('setnick_naver UserModel.update err');
          output.status=1003;
          res.send(output);
          return;
        }
        console.log('setnick success: '+nick);
        output.status=100;
        res.send(output);
      });
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.setnicknaver = setnicknaver;