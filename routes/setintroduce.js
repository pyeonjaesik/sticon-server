var setintroduce = function(req, res) {
  var _id=req.body._id||'';
  var text=req.body.text||'';
  console.log(_id+'/'+text);
  var output={};
	var database = req.app.get('database');
	if (database.db) {
    database.UserModel.update({_id},{intro:text},(err)=>{
      if(err){
        console.log('setintroduce err');
        output.status=401;
        res.send(output);
        return;
      }
      console.log('set introduce success');
      output.status=100;
      res.send(output);
    });
	} else {
    output.status =410;
    res.send(output);
	}
	
};
module.exports.setintroduce = setintroduce;