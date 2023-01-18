var getgroup = async function(req, res) {
  console.log('getgroup');
  var user_id=req.body.user_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({user_id},async (err,results)=>{
      if(err){
        console.log('getgroup err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var _id=results[0]._doc._id;
        var data_my_follow=await database.FollowModel.find({_id});
        if(data_my_follow.errors||data_my_follow.length===0){
          console.log('FollowModel.find err');
          output.status=401;
          res.send(output);
          return;
        }
        var group_array=[];

        group_array=data_my_follow[0]._doc.group.map(x=>x); //id

        var group = await database.GroupModel.find({id:{$in:group_array}});
        if(group.errors){
          console.log('getgroup GroupModel.find err');
          output.status=404;
          res.send(output);
          return;
        }
        output.groupList=group.map(em=>{
          return{
            id:em._doc.id,
            member:em._doc.member
          }
        });
        console.log(output.groupList);
        output.status=100;
        res.send(output);
      }else{
        console.log('getgroup results.length==0 --> err');
        output.status=401;
        res.send(output);
        return;
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getgroup = getgroup;