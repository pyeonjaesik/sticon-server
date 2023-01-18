var getgroupmember = async function(req, res) {
  console.log('getgroupmember');
  var group_id=req.body.group_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_group=await database.FollowModel.find({group:{$in:[group_id]}});
    if(find_group.errors){
      console.log('find_group err');
      output.status=401;
      res.send(output);
      return;
    }
    if(find_group.length==0){
      console.log('no group member')
      output.status=102;
      res.send(output);
      return;
    }
    var user_id_arr=find_group.map(em=>em._doc._id);
    var find_user=await database.UserModel.find({_id:{$in:user_id_arr}});
    if(find_user.errors){
      console.log('find_user err');
      output.status=402;
      res.send(output);
      return;
    }
    output.personList=find_user.map(em=>{
      return{
        id:em._doc.id,
        user_id:em._doc.user_id,
        img:em._doc.img
      }
    });
    var find_group2 = await database.GroupModel.find({id:group_id});
    if(find_group2.errors){
      console.log('find_group2 error');
      output.status=403;
      res.send(output);
      return;
    }
    output.member=find_group2[0]._doc.member;
    console.log(output.personList);
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getgroupmember = getgroupmember;