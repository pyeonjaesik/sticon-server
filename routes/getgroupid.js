var getgroupid = async function(req, res) {
  const group_id=req.body.group_id;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    const find_group= await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('find_group error');
      output.status=401;
      res.send(output);
      return;
    }
    output._id=find_group[0]._doc._id.toString();
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getgroupid = getgroupid;