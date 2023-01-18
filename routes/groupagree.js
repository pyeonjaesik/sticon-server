var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);
var admin = require("firebase-admin");

var groupagree = async function(req,res){
  var _id = req.body._id||0;
  var group_name= req.body.id||'';
  var io = req.app.get('io');
  var database = req.app.get('database');    
  var output ={};
  if(database){
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length==0){
      console.log('groupagree');
      output.status=401;
      res.send(output);
      return;
    }
    const user_id=find_user[0]._doc.user_id;
    const ph=find_user[0]._doc.ph||user_id;
    const id=find_user[0]._doc.id;
    var find_group=await database.GroupModel.find({id:group_name});
    if(find_group.errors||find_group.length!=1){
      console.log('group agree: find_group error');
      output.status=402;
      res.send(output);
      return;
    }
    let user_id_arr=[];
    output.group={
      id:group_name,
      img:find_group[0]._doc.img
    }
    output.members=find_group[0]._doc.members.map(em=>{
      user_id_arr.push(em.user_id);
      return em;
    });
    output.wating=[];
    var w_i=false;
    await find_group[0]._doc.wating.map(em=>{
      if(em.invited==user_id||em.invited==ph){
        w_i=true;
      }else if(em.status===0){
        user_id_arr.push(em.invited);
        output.wating.push(em);
      }else{
        output.wating.push(em);
      }
    });
    if(!w_i){
      console.log('groupagree you are not invited');
      output.status=403;
      res.send(output);
      return;
    }

    var find_follow= await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('groupagree FollowModel.find err');
      output.status=402;
      res.send(output);
      return;
    }
    const block=[...find_follow[0]._doc.block];
    var VideoPost_new= await database.VideoModel.find({
      groupList:{$in:[group_name]},
      show:{$lt:200},
      report:{$nin:[user_id]},
      user_id:{$nin:block}
    }).sort({ct:-1}).limit(1000);
    if(VideoPost_new.errors){
      console.log('groupagree VideoPost err');
      output.status=403;
      res.send(output);
      return;
    }
    let post_id_arr=[];
    output.post=await VideoPost_new.map(em=>{
      user_id_arr.push(em._doc.user_id);
      post_id_arr.push(em._doc._id);
      return{
        post_id:em._doc._id.toString(),
        user_id:em._doc.user_id,
        text:em._doc.text,
        clip:em._doc.clip,
        ct:em._doc.ct,
        ut:em._doc.ut,
        ln:em._doc.ln,
        read:em._doc.read,
        lastRead:em._doc.lastRead,
        groupList:em._doc.groupList,
        cn:em._doc.cn,
        show:em._doc.show
      }
    });
    
    const find_comment= await database.CommentModel.find({_id:{$in:post_id_arr}});
    if(find_comment.errors){
      console.log('getmaingallery: find_comment error');
      output.status=406;
      res.send(output);
      return;
    }
    output.comment= find_comment.map(em=>{
      em._doc.cloud.map(emS=>{
        if(user_id_arr.indexOf(emS.user_id)==-1){
          user_id_arr.push(emS.user_id)
        }
      });
      if(em._doc.read[user_id]==undefined){
        var read=[];
      }else{
        var read=em._doc.read[user_id];
      }
      return {
        post_id:em._doc._id,
        cloud:em._doc.cloud,
        read
      }
    });
    const find_user_profile= await database.UserModel.find({user_id:{$in:user_id_arr}});
    if(find_user_profile.errors){
      console.log('groupagree find user profile error');
      output.status=405;
      res.send(output);
      return;
    }
    output.user_arr= find_user_profile.map(em=>{
      return{
        user_id:em._doc.user_id,
        id:em._doc.id,
        img:em._doc.img,
        connect:em._doc.connect||{type:false,time:0}
      }
    });
    database.GroupModel.update({id:group_name},{wating:output.wating,$inc:{member:1},$push:{members:{
      user_id,
      nickname:'',
      nickimg:'',
      status:''
    }}},(err)=>{
      if(err){
        console.log('group agree update error');
        output.status=404;
        res.send(output);
        return;
      }
      database.FollowModel.update({_id},{$push: { group: group_name.toString() }},async (err)=>{
        if(err){
          console.log('groupagree followmodel update error');
          output.status=405;
          res.send(output);
          return;
        }
        const member_user_id_arr=find_group[0]._doc.members.map(em=>em.user_id);
        const find_tk=await database.TkModel.find({user_id:{$in:member_user_id_arr}});
        if(find_tk.errors){
          console.log('groupagree error');
          output.status=406;
          res.send(output);
          return;
        }
        let client_tokens=find_tk.map(em=>em._doc.tk);
        let member_id_arr=find_tk.map(em=>em._doc._id);
        const alarm={
          type:'GROUPAGREE',
          ct:parseInt(Date.now()),
          user_id,
          group_id:group_name.toString()
        }
        database.AlarmModel.updateMany({
          _id:{$in:member_id_arr}
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
            console.log('group agree error');
            output.status=407;
            res.send(output);
            return;
          }
          find_tk.map(em=>{
            io.to(em._doc.socket).emit('GROUPAGREE',{
              id:group_name.toString(),
              profile:{
                user_id:find_user[0]._doc.user_id,
                id:find_user[0]._doc.id,
                img:find_user[0]._doc.img,
                connect:find_user[0]._doc.connect,
                ph:find_user[0]._doc.ph
              }
            });
          });
          console.log('groupagree success');
          output.status = 100;
          res.send(output);
          if(client_tokens.length==0){
            return;
          }
          admin.messaging().sendToDevice(
            client_tokens, // ['token_1', 'token_2', ...]
            {
              notification: {
                title: id,
                body: `${group_name} 그룹 초대를 수락하였습니다.`,
                sound: "default",
                // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
              },
              data: {
                type:'groupagree',
                groupid:group_name,
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
      })
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.groupagree = groupagree;