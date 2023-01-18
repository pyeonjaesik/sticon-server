var setphone = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var phone = req.body.phone||''; 
  console.log(_id+'/'+phone)
	var database = req.app.get('database');
	if (database.db) {
    database.UserModel.update({_id},{ph:phone},(err)=>{
      if(err){
        console.log('setphone err');
        output.status=401;
        res.send(output);
        return;
      }
      console.log('setphone success');
      output.status=100;
      res.send(output);
    });
	} else {
    output.status =4;
    res.send(output);
	}
};
module.exports.setphone = setphone;