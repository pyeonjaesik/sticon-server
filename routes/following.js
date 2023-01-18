var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);

var following = function(req,res){
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    database.FollowModel.find({_id},(err,results)=>{
      if(err){
        console.log('FollowModel.find');
        output.status=400;
        res.send(output);
        return;
      }
      if(results.length>0){
        if(results[0]._doc.follow.indexOf(user_id)!==-1){
          console.log('aleady Follow');
          output.status=102;
          res.send(output);
          return;
        }
        var unFollow_temp=results[0]._doc.unfollow||[];
        var unfollow_unique=unFollow_temp.reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);
        var u_i=unfollow_unique.indexOf(user_id);
        if(u_i!=-1){
          unfollow_unique.splice(u_i,1);
        }

        var block_temp=results[0]._doc.block||[];
        var block_unique=block_temp.reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);
        var b_i=block_unique.indexOf(user_id);
        if(b_i!=-1){
          block_unique.splice(b_i,1);
        }
        console.log('block_temp',block_temp);
        console.log('block_unique',block_unique);
        database.FollowModel.update({_id},{$push: { follow: user_id.toString() },unfollow:unfollow_unique,block:block_unique},(err)=>{
          if(err){
            console.log('FollowModel.find err');
            output.status=401;
            res.send(output);
            return;
          }
          database.UserModel.find({user_id},(err,results)=>{
            if(err){
              console.log('UserModel.find err');
              output.status=402;
              res.send(output);
              return;
            }
            if(results.length>0){
              var your_id=results[0]._doc._id;
              database.FollowModel.update({_id:your_id},{$inc:{follower:1}},async (err)=>{
                if(err){
                  console.log('FollowModel.update err');
                  output.status=404;
                  res.send(output);
                  return;
                }
                var find_my_profile= await database.UserModel.find({_id});
                if(find_my_profile.errors||find_my_profile.length==0){
                  console('following find_my_profile_error');
                  output.status=601;
                  res.send(output);
                  return;
                }
                var myid=find_my_profile[0]._doc.id;
                var my_img=find_my_profile[0]._doc.img;
                var find_tk= await database.TkModel.find({_id:your_id});
                if(find_tk.errors){
                  console.log('talk find token err');
                  output.status=401;
                  res.send(output);
                  return;
                }
                var client_token=find_tk[0]._doc.tk
                var push_data = {
                  to: client_token,
                  notification: {
                    title: myid,
                    body: '회원님을 팔로우합니다.',
                    sound: "default",
                    icon: "fcm_push_icon"
                  },
                  priority: "high",
                  restricted_package_name: "com.yomencity.puppy",
                  data: {
                    id:myid,
                    img:my_img,
                    type:'follow'
                  }
                };
                console.log('follow success')
                output.status=100;
                res.send(output);
                
                // fcm.send(push_data, function(err, response) {
                //   if (err) {
                //     console.log(err)
                //     output.status=700;
                //     return;
                //   }
                //   console.log('following: push success')
                // }); 
              });
            }else{
              console.log('UserModel.find results.length==0 -->');
              output.status=404;
              res.send(output);
            }
          });
        });
      }else{
        console.log('FollowModel.find resulst.length==0 -->err');
        output.status=401;
        res.send(output);
      }
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.following = following;