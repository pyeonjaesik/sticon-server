var admin = require("firebase-admin");

var makecloud = async function(req, res) {
  console.log('makeclouds');
  var _id=req.body._id;
  var post_id=req.body.post_id;
  var cloud=req.body.cloud;
  var output={};
  var database = req.app.get('database');
  var io = req.app.get('io');

	if (database.db) {
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length==0){
      console.log('makecloud: err');
      output.status=401;
      res.send(output);
      return;
    }
    var user_id=find_user[0]._doc.user_id;
    var id=find_user[0]._doc.id;
    var img=find_user[0]._doc.img;
    var find_comment= await database.CommentModel.find({_id:post_id});
    if(find_comment.errors||find_comment.length===0){
      console.log('makecloud: find_comment error');
      output.status=401;
      res.send(output);
      return;
    }
    var read=find_comment[0]._doc.read;
    var cloudLeng=1;
    for(var i in find_comment[0]._doc.cloud){
      if(find_comment[0]._doc.cloud[i].index==cloud.index){
        cloudLeng++;
      }
    }
    if(read[user_id]!=undefined){
      read[user_id][cloud.index]=cloudLeng;
    }else{
      read[user_id]=[];
      read[user_id][cloud.index]=cloudLeng;
    }
    database.CommentModel.update({_id:post_id},{$push:{cloud:{
        ...cloud,
        user_id,
        ct:parseInt(Date.now())
      }},
      read
    },async (err)=>{
      if(err){
        console.log('makecloud update error');
        output.status=403;
        res.send(output);
        return;
      }
      var find_post= await database.VideoModel.find({_id:post_id});
      if(find_post.errors||find_post.length==0){
        console.log('makecloud find_post error');
        output.status=404;
        res.send(output);
        return;
      }
      if(find_post[0]._doc.show==200){
        console.log('makecloud: video not ready');
        output.status=200;
        res.send(output);
        return;
      }
      var groupList=find_post[0]._doc.groupList;
      var clip_comp=find_post[0]._doc.clip[cloud.index];
      var find_user= await database.FollowModel.find({group:{$in:groupList}});
      if(find_user.errors||find_user.length===0){
        console.log('makecloud: find_user error');
        output.status=405;
        res.send(output);
        return;
      }
      let _id_arr=[];
      find_user.map(em=>{
        if(em._doc._id==_id){
          return;
        }
        _id_arr.push(em._doc._id);
        io.to(em._doc.socket).emit('CLOUD',{
          post_id,
          maker:{
            user_id,
            id,
            img
          },
          cloud:{
            ...cloud,
            ct:parseInt(Date.now()),
            clip:clip_comp
          }
        });
      });
      const find_token= await database.TkModel.find({_id:{$in:_id_arr}});
      if(find_token.errors){
        console.log('makecloud findtoken error');
        output.status=404;
        res.send(output);
        return;
      }
      let client_tokens=find_token.map(em=>em._doc.tk);
      console.log('makecloud success');
      output.status=100;
      res.send(output);
      if(client_tokens.length==0){
        return;
      }
      admin.messaging().sendToDevice(
        client_tokens, // ['token_1', 'token_2', ...]
        {
          notification: {
            title: id,
            body: `${groupList[0]} 그룹에 스티콘을 달았습니다.`,
            sound: "default",
            // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
          },
          data: {
            type:'makecloud',
            groupid:groupList[0],
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
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.makecloud = makecloud;