var setvanhana = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var vanhana = req.body.sns||{url:'',follow:0};
  var database = req.app.get('database');
  console.log('set vanhana');
	if (database.db) {
    database.UserModel.update({_id},{vanhana},(err)=>{
      if(err){
        console.log('set vanhana error');
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
module.exports.setvanhana = setvanhana;