var unfollowing = async (req,res)=>{
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    const find_follow= await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('FollowModel.find');
      output.status=400;
      res.send(output);
      return;
    }
    let unFollow_temp=[
      user_id,
      ...find_follow[0]._doc.unfollow
    ];
    const unfollow_unique=unFollow_temp.reduce((unique, item) =>
    unique.includes(item) ? unique : [...unique, item], []);
    
    let follow=[...find_follow[0]._doc.follow];
    follow=follow.filter(em=>em!=user_id);

    let request=[...find_follow[0]._doc.request];
    request=request.filter(em=>em.user_id!=user_id);

    database.FollowModel.update({_id},{
      unfollow:unfollow_unique,
      follow,
      request
    },(err)=>{
      if(err){
        console.log('FollowModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
      console.log('unfollow success');
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.unfollowing = unfollowing;