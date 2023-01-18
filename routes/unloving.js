var unloving = function(req,res){
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
        var video_temp=results[0]._doc.video;
        var f_i=video_temp.indexOf(post_id);
        if(f_i==-1){
          console.log('aleady unlove');
          output.status=102;
          res.send(output);
          return;
        }
        video_temp.splice(f_i,1);
        database.LvModel.update({_id},{video:video_temp},(err)=>{
          if(err){
            console.log('LvModel.find err');
            output.status=401;
            res.send(output);
            return;
          }
          database.VideoModel.update({_id:post_id},{$inc:{ln:-1}},async (err)=>{
            if(err){
              console.log('LvModel.update err');
              output.status=404;
              res.send(output);
              return;
            }
            var find_profile = await database.UserModel.find({_id});
            if(find_profile.errors||find_profile.length==0){
              console.log('unloving error');
              output.status=405;
              res.send(output);
              return;
            }
            var myuser_id=find_profile[0]._doc.user_id;
            
            var find_video= await database.VideoModel.find({_id:post_id});
            if(find_video.errors||find_video.length==0){
              console.log('find video error');
              output.status=406;
              res.send(output);
              return;
            }
            var post_user_id=find_video[0]._doc.user_id;
            if(myuser_id==post_user_id){
              console.log('unlove success');
              output.status=100;
              res.send(output);
              return;
            }
            var find_user= await database.UserModel.find({user_id:post_user_id});
            if(find_user.errors||find_user.length==0){
              console.log('unloving error');
              output.status=411;
              res.send(output);
              return;
            }
            var poster_id=find_user[0]._doc._id;
            ///
            var find_alarm=await database.AlarmModel.find({_id:poster_id});
            if(find_alarm.errors||find_alarm.length==0){
              console.log('loving find_alarm error');
              output.status=409;
              res.send(output);
              return;
            }
            var alarm=find_alarm[0]._doc.alarm.map(x=>x);
            var a_i=alarm.findIndex(em=>em.type=='love'&&em.post_id==post_id);
            if(a_i!=-1){
              let alarm_temp_user_arr=alarm[a_i].user_arr;
              var at_i=alarm_temp_user_arr.indexOf(myuser_id);
              if(at_i!=-1){
                alarm_temp_user_arr.splice(at_i,1);
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
              console.log('unlove success');
              output.status=100;
              res.send(output);
            });
            ///
          });
        });
      }else{
        console.log('LvModel.find resulst.length==0 -->err');
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
module.exports.unloving = unloving;