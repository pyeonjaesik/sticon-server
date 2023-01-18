var getprofile = async function(req, res) {
  var user_id=req.body.user_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_user=await database.UserModel.find({user_id});
    if(find_user.errors||find_user.length==0){
      console.log('getprofile err');
      output.status=401;
      res.send(output);
      return;
    }
    var _id=find_user[0]._doc._id;
    output.profile={
      uid:find_user[0]._doc.uid,
      id:find_user[0]._doc.id,
      img:find_user[0]._doc.img
    }
    var find_follow=await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length==0){
      console.log('getprofile err');
      output.status=402;
      res.send(output);
      return;
    }

    var follow=[...find_follow[0]._doc.follow];
    var group=[...find_follow[0]._doc.group];
    var find_follower= await database.FollowModel.find({follow:{$in:[user_id]}});
    if(find_follower.errors){
      console.log('autologin findfollower error');
      output.status=401;
      res.send(output);
      return;
    }
    var follower_id= find_follower.map(em=>em._doc._id.toString());
    var find_friends=await database.UserModel.find({$or:[
      {user_id:{$in:follow}},
      {_id:{$in:follower_id}}
    ]});
    if(find_friends.errors){
      console.log('autologin find_friends errors');
      output.status=411;
      res.send(output);
      return;
    }
    output.follow=[];
    output.follower=[];
    for(let index in find_friends){
      if(follow.indexOf(find_friends[index]._doc.user_id)!=-1){
        output.follow.push({
          user_id:find_friends[index]._doc.user_id,
          uid:find_friends[index]._doc.uid,
          id:find_friends[index]._doc.id,
          img:find_friends[index]._doc.img,
        })
      }
      if(follower_id.indexOf(find_friends[index]._doc._id.toString())!=-1){
        output.follower.push({
          user_id:find_friends[index]._doc.user_id,
          uid:find_friends[index]._doc.uid,
          id:find_friends[index]._doc.id,
          img:find_friends[index]._doc.img,
        })
      }
    }
    var find_group=await database.GroupModel.find({id:{$in:group}});
    if(find_group.errors){
      console.log('autologin find_grpup errors');
      output.status=412;
      res.send(output);
      return;
    }
    output.group=await find_group.map(em=>{
      return{
        id:em._doc.id,
        member:em._doc.member,
        img:em._doc.img||''
      }
    });
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getprofile = getprofile;