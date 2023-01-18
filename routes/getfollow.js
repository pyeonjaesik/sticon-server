var getfollow = async function(req, res) {
  console.log('getfollow');
  var user_id=req.body.user_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({user_id},async (err,results)=>{
      if(err){
        console.log('getfollow err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var _id=results[0]._doc._id;
        output.uid=results[0]._doc.uid;
        var data_my_follow=await database.FollowModel.find({_id});
        if(data_my_follow.errors||data_my_follow.length===0){
          console.log('FollowModel.find err');
          output.status=401;
          res.send(output);
          return;
        }
        var follow_array=[];

        follow_array=data_my_follow[0]._doc.follow.map(x=>x); //user_id

        var user_follow = await database.UserModel.find({user_id:{$in:follow_array}});
        if(user_follow.errors){
          console.log('getfollow UserModel.find err');
          output.status=402;
          res.send(output);
          return;
        }
        output.follow=user_follow.map(em=>{
          return{
            user_id:em._doc.user_id,
            id:em._doc.id,
            udi:em._doc.uid,
            img:em._doc.img
          }
        });
        console.log(output);
        output.status=100;
        res.send(output);
      }else{
        console.log('getfollow results.length==0 --> err');
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
module.exports.getfollow = getfollow;