var admin = require("firebase-admin");

var followagree = async (req,res)=>{
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');    
  var io = req.app.get('io');
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

    const find_follow = await database.FollowModel.find({_id:yourProfile._id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('FollowModel.find');
      output.status=400;
      res.send(output);
      return;
    }
    if(find_follow[0]._doc.follow.indexOf(myProfile.user_id)!=-1){
      console.log('aleady Follow');
      output.status=102;
      res.send(output);
      return;
    }
    if(find_follow[0]._doc.request.findIndex(em=>em.user_id==myProfile.user_id)===-1){
      console.log('not request');
      output.status=103;
      res.send(output);
      return;
    }
    let unfollow=[...find_follow[0]._doc.unfollow];
    unfollow=unfollow.filter(em=>em!=myProfile.user_id);

    let block=[...find_follow[0]._doc.block];
    block=block.filter(em=>em!=myProfile.user_id);

    let request=[...find_follow[0]._doc.request];
    request=request.filter(em=>em.user_id!=myProfile.user_id);

    database.FollowModel.update({_id:yourProfile._id},{
      $push: { follow: myProfile.user_id.toString() },
      request,
      unfollow,
      block,
    },async (err)=>{
      if(err){
        console.log('FollowModel.find err');
        output.status=401;
        res.send(output);
        return;
      }

      var find_tk= await database.TkModel.find({_id:yourProfile._id});
      if(find_tk.errors||find_tk.length!=1){
        console.log('talk find token err');
        output.status=401;
        res.send(output);
        return;
      }
      const client_token=find_tk[0]._doc.tk;
      const alarm={
        type:'FOLLOWAGREE',
        ct:parseInt(Date.now()),
        user_id:myProfile.user_id,
      }
      database.AlarmModel.update({
        _id:yourProfile._id
      },{
        $push:
        {
          alarm:{
            $each:[alarm],
            $position:0
          }
        }
      },(err)=>{
        if(err){
          console.log('follow agree error');
          output.status=407;
          res.send(output);
          return;
        }
        console.log('follow agree success');
        output.status = 100;
        res.send(output);
        io.to(find_tk[0]._doc.socket).emit('FOLLOWAGREE',{
          profile:{
            user_id:myProfile.user_id,
            id:myProfile.id,
            img:myProfile.img,
          }
        });
        admin.messaging().sendToDevice(
          [client_token], // ['token_1', 'token_2', ...]
          {
            notification: {
              title: myProfile.id,
              body: `팔로우를 수락하였습니다.`,
              sound: "default",
              // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
            },
            data: {
              type:'followagree',
              id:myProfile.id
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
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.followagree = followagree;