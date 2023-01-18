var getchat = function(req, res) {
  console.log('get chat');
  var _id=req.body._id||'';
  var your_user_id=req.body.your_user_id||'';

  console.log('_id:'+_id)
  var output={};
  output.post=[];
  var io = req.app.get('io');
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({_id},async (err,results)=>{
      if(err){
        console.log('get chat list err1');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var user_id=results[0]._doc.user_id;
        var find_follow=await database.FollowModel.find({_id});
        if(find_follow.errors||find_follow.length==0){
          console.log('getchat: FollowModel.find err');
          output.status=401;
          res.send(output);
          return;
        }
        var block=await find_follow[0]._doc.block.map(x=>x);
        if(your_user_id==''){
          database.ChatRoomModel.find({$and:[{player:{$in:[user_id]}},{player:{$nin:block}}]},async (err,results)=>{
            if(err){
              console.log('get chat list err2');
              output.status=401;
              res.send(output);
              return;
            }
            if(results.length>0){
              var user_id_arr=[];
              output.post=results.map(em=>{
                for(var i=0;i<2;i++){
                  console.log(em._doc.info[i].user_id);
                  if(em._doc.info[i].user_id!=user_id&&user_id_arr.indexOf(em._doc.info[i].user_id)===-1){
                    user_id_arr.push(em._doc.info[i].user_id);
                  }
                }
                return{
                  info:em._doc.info,
                  room:em._doc.room[0],
                  updatetime:em._doc.updatetime
                }
              });
              console.log(output.post[0].info)
              database.UserModel.find({user_id:{$in:user_id_arr}},(err,results)=>{
                if(err){
                  console.log('UserModel.find err');
                  output.status=403;
                  res.send(output);
                  return;
                }
                if(results.length>0){
                  output.user_arr= results.map(em=>{
                    return{
                      user_id:em._doc.user_id,
                      id:em._doc.id,
                      img:em._doc.img
                    }
                  })
                  console.log(output);
                  output.status=100;
                  res.send(output);
                }else{
                  console.log(user_id_arr);
                  console.log('UserModel.find with user_id_arr-->err');
                  output.status=403;
                  res.send(output);
                }
              });
            }else{
              console.log('get chat list length ==0');
              output.status=100;
              res.send(output);
              return;
            }
          }).sort({updatetime:-1}).limit(200);
        }else{
          var my_user_id=user_id;
          if(your_user_id==my_user_id){
            console.log('my_user_id== your_user_id')
            output.status=500;
            res.send(output);
            return;
          }
          database.ChatRoomModel.find({player: { $all: [ my_user_id, your_user_id ] }},async (err,results)=>{
            if(err){
              console.log('ChatRoomModel.find err');
              output.status=408;
              res.send(output);
              return;
            }
            if(results.length>0){
              output.room = await results[0]._doc.room.map(x=>x);
              var info = results[0]._doc.info;
              output.info=info;
              var my_f_i = info.findIndex(em=>em.user_id==my_user_id);
              var your_f_i = info.findIndex(em=>em.user_id==your_user_id);
              info=[
                {
                  user_id:info[my_f_i].user_id,
                  show:true,
                  bedge:0
                },
                {
                  user_id:info[your_f_i].user_id,
                  show:true,
                  bedge:(info[your_f_i].bedge)
                }
              ]
              database.ChatRoomModel.update({player:{ $all:[my_user_id,your_user_id]}},{
                info,
              },(err)=>{
                if(err){
                  console.log('talk: ChatModel.update err');
                  output.status=412;
                  res.send(output);
                  return;
                }
                database.UserModel.find({user_id:your_user_id},(err,results)=>{
                  if(err){
                    console.log('talk: UserModel.find2 err');
                    output.status=404;
                    res.send(output);
                    return;
                  }
                  if(results.length>0){
                    output.profile={
                      user_id:your_user_id,
                      img:results[0]._doc.img,
                      id:results[0]._doc.id
                    }
                    io.to(results[0]._doc.socket).emit('READ',{user_id:my_user_id});
                    database.ChatRoomModel.find({$and:[{player:{$in:[user_id]}},{player:{$nin:block}}]},async (err,results)=>{
                      if(err){
                        console.log('get chat list err2');
                        output.status=401;
                        res.send(output);
                        return;
                      }
                      if(results.length>0){
                        var user_id_arr=[];
                        output.post=results.map(em=>{
                          for(var i=0;i<2;i++){
                            console.log(em._doc.info[i].user_id);
                            if(em._doc.info[i].user_id!=user_id&&user_id_arr.indexOf(em._doc.info[i].user_id)===-1){
                              user_id_arr.push(em._doc.info[i].user_id);
                            }
                          }
                          return{
                            info:em._doc.info,
                            room:em._doc.room[0],
                            updatetime:em._doc.updatetime
                          }
                        });
                        console.log(output.post[0].info)
                        database.UserModel.find({user_id:{$in:user_id_arr}},(err,results)=>{
                          if(err){
                            console.log('UserModel.find err');
                            output.status=403;
                            res.send(output);
                            return;
                          }
                          if(results.length>0){
                            output.user_arr= results.map(em=>{
                              return{
                                user_id:em._doc.user_id,
                                id:em._doc.id,
                                img:em._doc.img
                              }
                            })
                            console.log(output);
                            output.status=100;
                            res.send(output);
                          }else{
                            console.log(user_id_arr);
                            console.log('UserModel.find with user_id_arr-->err');
                            output.status=403;
                            res.send(output);
                          }
                        });
                      }else{
                        console.log('get chat list length ==0');
                        output.status=100;
                        res.send(output);
                        return;
                      }
                    }).sort({updatetime:-1}).limit(200);
                  }else{
                    console.log('get talk:UserModel.find2 results.length ==0 -->err');
                    output.status=405;
                    res.send(output);
                  }
                });
              });
            }else{
              var find_your_profile=await database.UserModel.find({user_id:your_user_id});
              if(find_your_profile.errors||find_your_profile.length==0){
                console.log('getchat find_your_profile error');
                output.status=420;
                res.send(output);
                return;
              }
              output.profile={
                user_id:your_user_id,
                id:find_your_profile[0]._doc.id,
                img:find_your_profile[0]._doc.img
              }
              output.room=[];
              database.ChatRoomModel.find({$and:[{player:{$in:[user_id]}},{player:{$nin:block}}]},async (err,results)=>{
                if(err){
                  console.log('get chat list err2');
                  output.status=401;
                  res.send(output);
                  return;
                }
                if(results.length>0){
                  var user_id_arr=[];
                  output.post=results.map(em=>{
                    for(var i=0;i<2;i++){
                      console.log(em._doc.info[i].user_id);
                      if(em._doc.info[i].user_id!=user_id&&user_id_arr.indexOf(em._doc.info[i].user_id)===-1){
                        user_id_arr.push(em._doc.info[i].user_id);
                      }
                    }
                    return{
                      info:em._doc.info,
                      room:em._doc.room[0],
                      updatetime:em._doc.updatetime
                    }
                  });
                  console.log(output.post[0].info)
                  database.UserModel.find({user_id:{$in:user_id_arr}},(err,results)=>{
                    if(err){
                      console.log('UserModel.find err');
                      output.status=403;
                      res.send(output);
                      return;
                    }
                    if(results.length>0){
                      output.user_arr= results.map(em=>{
                        return{
                          user_id:em._doc.user_id,
                          id:em._doc.id,
                          img:em._doc.img
                        }
                      })
                      console.log(output);
                      output.status=100;
                      res.send(output);
                    }else{
                      console.log(user_id_arr);
                      console.log('UserModel.find with user_id_arr-->err');
                      output.status=403;
                      res.send(output);
                    }
                  });
                }else{
                  console.log('get chat list length ==0');
                  output.status=100;
                  res.send(output);
                  return;
                }
              }).sort({updatetime:-1}).limit(200);
            }
          });
        }
      }else{
        console.log('get chat list: userModel.find results.length ==0 -->err');
        output.status=402;
        res.send(output);
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getchat = getchat;