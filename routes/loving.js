var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);

var loving = function(req,res){
  var _id = req.body._id||0;
  var post_id=req.body.post_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    database.LvModel.find({_id},(err,results)=>{
      if(err){
        console.log('LvModel.find');
        output.status=400;
        res.send(output);
        return;
      }
      if(results.length>0){
        if(results[0]._doc.video.indexOf(post_id)!==-1){
          console.log('aleady love');
          output.status=102;
          res.send(output);
          return;
        }
        database.LvModel.update({_id},{$push: { video: post_id.toString() }},async (err)=>{
          if(err){
            console.log('LvModel.find err');
            output.status=401;
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
          var myuser_id=find_my_profile[0]._doc.user_id;

          database.VideoModel.update({_id:post_id},{$inc:{ln:1},lastRead:{
            user_id:myuser_id,
            id:myid,
            img:my_img
          }},async (err)=>{
            if(err){
              console.log('LvModel.update err');
              output.status=404;
              res.send(output);
              return;
            }
            var find_video= await database.VideoModel.find({_id:post_id});
            if(find_video.errors||find_video.length==0){
              console.log('loving VideoModel.find erros');
              output.status=405;
              res.send(output);
              return;
            }
            var your_user_id=find_video[0]._doc.user_id;

            if(your_user_id==myuser_id){
              output.status=100;
              res.send(output);
              return;
            }

            var find_tk= await database.TkModel.find({user_id:your_user_id});
            if(find_tk.errors){
              console.log('talk find token err');
              output.status=401;
              res.send(output);
              return;
            }
            var client_token=find_tk[0]._doc.tk;
            var poster_id=find_tk[0]._doc._id;
            var push_data = {
              to: client_token,
              notification: {
                title: myid,
                body: '회원님의 영상을 좋아합니다.',
                sound: "default",
                icon: "fcm_push_icon"
              },
              priority: "high",
              restricted_package_name: "com.yomencity.puppy",
              data: {
                id:myid,
                img:my_img,
                type:'love'
              }
            };
            var find_alarm=await database.AlarmModel.find({_id:poster_id});
            if(find_alarm.errors||find_alarm.length==0){
              console.log('loving find_alarm error');
              output.status=409;
              res.send(output);
              return;
            }
            var alarm=find_alarm[0]._doc.alarm.map(x=>x);
            var a_i=alarm.findIndex(em=>em.type=='love'&&em.post_id==post_id);
            if(a_i===-1){
              alarm.unshift({
                type:'love',
                post_id,
                user_arr:[myuser_id],
                ct:parseInt(Date.now()),
              })
            }else{
              let alarm_temp_user_arr=alarm[a_i].user_arr;
              if(alarm_temp_user_arr.indexOf(myuser_id)==-1){
                alarm_temp_user_arr.unshift(myuser_id);
              }
              alarm.splice(a_i,1,{
                type:'love',
                post_id,
                user_arr:alarm_temp_user_arr,
                ct:parseInt(Date.now())
              })
            }
            database.AlarmModel.update({_id:poster_id},{alarm},(err)=>{
              if(err){
                console.log('AlarmModel.udpate error');
                output.status=411;
                res.send(output);
                return;
              }
              output.status=100;
              res.send(output);
              fcm.send(push_data, function(err, response) {
                if (err) {
                  console.log(err)
                  output.status=700;
                  return;
                }
                console.log('following: push success')
              });
            });
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
module.exports.loving = loving;