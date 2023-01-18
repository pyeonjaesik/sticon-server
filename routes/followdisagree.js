var followdisagree = async function(req,res){
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    const find_profile= await database.UserModel.find({
      $or:[
        {_id},
        {user_id}
      ]
    });
    if(find_profile.errors||find_profile.length!=2){
      console('following find_profile');
      output.status=601;
      res.send(output);
      return;
    }
    const myProfile= find_profile.find(em=>em._doc._id.toString()==_id.toString())._doc;
    const yourProfile=find_profile.find(em=>em._doc.user_id.toString()==user_id.toString())._doc;

    const find_follow= await database.FollowModel.find({_id:yourProfile._id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('FollowModel.find');
      output.status=400;
      res.send(output);
      return;
    }

    let follow=[...find_follow[0]._doc.follow];
    follow=follow.filter(em=>em!=myProfile.user_id);

    let request=[...find_follow[0]._doc.request];
    request=request.filter(em=>em.user_id!=myProfile.user_id);
    database.FollowModel.update({_id:yourProfile._id},{
      follow,
      request,
    },(err)=>{
      if(err){
        console.log('followdisagree: FollowModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      console.log('followdisagree success')
      output.status=100;
      res.send(output);
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.followdisagree = followdisagree;