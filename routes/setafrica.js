var setafrica = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var africa = req.body.sns||{url:'',follow:0};
  var database = req.app.get('database');
  console.log('set africa');
  console.log(africa)
	if (database.db) {
    database.UserModel.update({_id},{africa},(err)=>{
      if(err){
        console.log('set africa error');
        output.status=401;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
      return;
    });
	} else {
    output.status =410;
    res.send(output);
	}
	
};
module.exports.setafrica = setafrica;