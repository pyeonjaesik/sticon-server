var unrequesting = async function(req,res){
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

    let follow=[...find_follow[0]._doc.follow];
    follow=follow.filter(em=>em!=user_id);

    let request=[...find_follow[0]._doc.request];
    request=request.filter(em=>em.user_id!=user_id);

    database.FollowModel.update({_id},{
      follow,
      request,
    },(err)=>{
      if(err){
        console.log('unrequest: FollowModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      console.log('unrequest success')
      output.status=100;
      res.send(output);
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.unrequesting = unrequesting;