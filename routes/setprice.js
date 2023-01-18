var setprice = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var price = parseInt(req.body.price)||0;
  if(price<0){
    price=0;
  }
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.update({_id},{price},(err)=>{
      if(err){
        console.log('set price error');
        output.status=401;
        res.send(output);
        return;
      }
      console.log('set price success');
      output.status=100;
      res.send(output);
      return;
    });
	} else {
    output.status =410;
    res.send(output);
	}
	
};
module.exports.setprice = setprice;