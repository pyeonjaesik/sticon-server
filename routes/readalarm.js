var readalarm = async function(req, res) {
  var _id=req.body._id;
  var ct=req.body.ct;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    const find_alarm=await database.AlarmModel.find({_id});
    if(find_alarm.errors||find_alarm.length!=1){
      console.log('read alarm error');
      output.status=401;
      res.send(output);
      return;
    }
    let alarm=find_alarm[0]._doc.alarm.filter(em=>em.ct!=ct);
    database.AlarmModel.update({_id},{alarm},(err)=>{
      if(err){
        console.log('read alarm error');
        output.status=402;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.readalarm = readalarm;