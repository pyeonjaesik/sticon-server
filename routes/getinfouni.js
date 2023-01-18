var getinfouni = async function(req, res) {
  console.log('getinfouni');
  var user_id=req.body.user_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({user_id},async (err,results)=>{
      if(err){
        console.log('getinfouni err');
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
        var follow_array=[];
        var group_array=[];
        var follower_array=[];

        follow_array=data_my_follow[0]._doc.follow.map(x=>x); //user_id
        group_array=data_my_follow[0]._doc.group.map(x=>x); //id

        var data_follower = await database.FollowModel.find({follow:{$in:[user_id]}});
        follower_array=data_follower.map(em=>em._doc._id); //_id

        var user_follow = await database.UserModel.find({user_id:{$in:follow_array}});
        if(user_follow.errors){
          console.log('getinfouni UserModel.find err');
          output.status=402;
          res.send(output);
          return;
        }
        output.follow=user_follow.map(em=>{
          return{
            user_id:em._doc.user_id,
            id:em._doc.id,
            img:em._doc.img
          }
        });

        var user_follower = await database.UserModel.find({_id:{$in:follower_array}});
        if(user_follower.errors){
          console.log('getinfouni UserModel.find err');
          output.status=402;
          res.send(output);
          return;
        }
        output.follower=user_follower.map(em=>{
          return{
            user_id:em._doc.user_id,
            id:em._doc.id,
            img:em._doc.img
          }
        });
        console.log(group_array);
        var group = await database.GroupModel.find({id:{$in:group_array}});
        if(group.errors){
          console.log('getinfouni GroupModel.find err');
          output.status=404;
          res.send(output);
          return;
        }
        console.log(group);
        output.groupList=group.map(em=>{
          return{
            id:em._doc.id,
            member:em._doc.member
          }
        });
        output.status=100;
        res.send(output);
      }else{
        console.log('getinfouni results.length==0 --> err');
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
module.exports.getinfouni = getinfouni;