
var setnick = function(req, res) {
  console.log('setnick');
  var output={};
  var _id = req.body._id||0;
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
    database.UserModel.update({_id},{'id':nick,id_query},function(err){
      if(err){
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
module.exports.setnick = setnick;