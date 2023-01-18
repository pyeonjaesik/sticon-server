var admin = require("firebase-admin");

var requesting = async function(req,res){
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');
  var io = req.app.get('io');    
  var output ={};
  if(database){
    const find_follow= await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('FollowModel.find');
      output.status=400;
      res.send(output);
      return;
    }
    let request=[...find_follow[0]._doc.request];
    if(request.findIndex(em=>em.user_id==user_id)!=-1){
      console.log('aleady REQUEST');
      output.status=102;
      res.send(output);
      return;
    }
    request.unshift({
      user_id,
      ct:parseInt(Date.now())
    });
    if(find_follow[0]._doc.follow.indexOf(user_id)!=-1){
      console.log('aleady FOLLOW');
      output.status=103;
      res.send(output);
      return;
    }
    var unFollow_temp=[...find_follow[0]._doc.unfollow];
    var unfollow_unique=unFollow_temp.reduce((unique, item) =>
    unique.includes(item) ? unique : [...unique, item], []);
    var u_i=unfollow_unique.indexOf(user_id);
    if(u_i!=-1){
      unfollow_unique.splice(u_i,1);
    }
    var block_temp=[...find_follow[0]._doc.block];
    var block_unique=block_temp.reduce((unique, item) =>
    unique.includes(item) ? unique : [...unique, item], []);
    var b_i=block_unique.indexOf(user_id);
    if(b_i!=-1){
      block_unique.splice(b_i,1);
    }
    database.FollowModel.update({_id},{
      request,
      unfollow:unfollow_unique,
      block:block_unique
    },async (err)=>{
      if(err){
        console.log('FollowModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      var find_my_profile= await database.UserModel.find({_id});
      if(find_my_profile.errors||find_my_profile.length==0){
        console('requesting find_my_profile_error');
        output.status=601;
        res.send(output);
        return;
      }
      const id = find_my_profile[0]._doc.id;
      var find_tk= await database.TkModel.find({user_id});
      if(find_tk.errors){
        console.log('talk find token err');
        output.status=401;
        res.send(output);
        return;
      }
      const client_token=find_tk[0]._doc.tk;
      io.to(find_tk[0]._doc.socket).emit('REQUESTING',{
        profile:{
          user_id:find_my_profile[0]._doc.user_id,
          id:find_my_profile[0]._doc.id,
          img:find_my_profile[0]._doc.img,
        }
      });
      console.log('request success')
      output.status=100;
      res.send(output);
      admin.messaging().sendToDevice(
        [client_token], // ['token_1', 'token_2', ...]
        {
          notification: {
            title: id,
            body: `팔로우를 수락해주세요.`,
            sound: "default",
            // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
          },
          data: {
            type:'requesting',
            id
          },
        },
        {
          // Required for background/quit data-only messages on iOS
          contentAvailable: true,
          // Required for background/quit data-only messages on Android
          priority: 'high',
        },
      );
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.requesting = requesting;