var setuid = function(req, res) {
  console.log('setuid');
  var output={};
  var _id = req.body._id||0;
  var uid = req.body.uid||0; 
  console.log(_id+'/'+uid)
	var database = req.app.get('database');
	if (database.db) {
    database.UserModel.update({_id},{uid},(err)=>{
      if(err){
        console.log('setuid UserModel.update err');
        output.status=1003;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
    })
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.setuid = setuid;