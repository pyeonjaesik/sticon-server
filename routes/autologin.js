var autologin = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var user_id = req.body.user_id||0;
  var fcmToken = req.body.fcmToken||0;
  var database = req.app.get('database');
	if (database.db) {
    console.log('_id:'+_id);
    database.UserModel.find({_id},function(err,results){
      if(err){
        console.log('autologin: UserModel find err');
        output.status=102;
        res.send(output);
        return;
      }
      if(results.length>0){
        if(user_id!==results[0]._doc.user_id){
          output.status=102;
          res.send(output);
          return;
        }
        output.id=results[0]._doc.id;
        output.uid=results[0]._doc.uid;
        output.img=results[0]._doc.img;
        output.video=results[0]._doc.video;
        output.intro=results[0]._doc.intro;
        output.price=results[0]._doc.price;
        output.sns={
          instagram:results[0]._doc.instagram,
          youtube:results[0]._doc.youtube,
          africa:results[0]._doc.africa,
          tiktok:results[0]._doc.tiktok,
          vanhana:results[0]._doc.vanhana,
        }
        if(results[0]._doc.pw==='0'){
          output.pwindex='false';
        }else{
          output.pwindex='true';
        }
        output.itr=results[0]._doc.itr;
        database.CoinModel.find({_id},function(err,results){
          if(err){
            console.log('signupfb: CoinModel.find err');
            output.status=403;
            res.send(output);
            return;
          }
          if(results.length>0){
            output.coin=results[0]._doc.coin;
            database.AlarmModel.find({_id},(err,results)=>{
              if(err){
                console.log('autologin : AlarmModel.find err');
                output.status=405;
                res.send(output);
                return;
              }
              if(results.length>0){
                output.leng=results[0]._doc.leng;
                database.FollowModel.find({_id},async (err,results)=>{
                  if(err){
                    console.log('FollowModel.find err');
                    output.status=407;
                    res.send(output);
                    return;
                  }
                  if(results.length>0){
                    var find_follower= await database.FollowModel.find({follow:{$in:[user_id]}});
                    if(find_follower.errors){
                      console.log('autologin findfollower error');
                      output.status=401;
                      res.send(output);
                      return;
                    }
                    var follower_id= find_follower.map(em=>em._doc._id.toString());
                    var follow=results[0]._doc.follow;
                    output.request=[...results[0]._doc.request];
                    var group=[...results[0]._doc.group];
                    var block=[...results[0]._doc.block];
                    database.LvModel.find({_id},async (err,results)=>{
                      if(err){
                        console.log('LvModel.find err');
                        output.status=408;
                        res.send(output);
                        return;
                      }
                      if(results.length>0){
                        output.lv=results[0]._doc.video.map(x=>x);
                        var find_friends=await database.UserModel.find({$or:[
                          {user_id:{$in:follow}},
                          {_id:{$in:follower_id}}
                        ]});
                        if(find_friends.errors){
                          console.log('autologin find_friends errors');
                          output.status=411;
                          res.send(output);
                          return;
                        }
                        output.follow=[];
                        output.follower=[];
                        for(let index in find_friends){
                          if(follow.indexOf(find_friends[index]._doc.user_id)!=-1){
                            output.follow.push({
                              user_id:find_friends[index]._doc.user_id,
                              uid:find_friends[index]._doc.uid,
                              id:find_friends[index]._doc.id,
                              img:find_friends[index]._doc.img,
                            })
                          }
                          if(follower_id.indexOf(find_friends[index]._doc._id.toString())!=-1){
                            output.follower.push({
                              user_id:find_friends[index]._doc.user_id,
                              uid:find_friends[index]._doc.uid,
                              id:find_friends[index]._doc.id,
                              img:find_friends[index]._doc.img,
                            })
                          }
                        }
                        var find_group=await database.GroupModel.find({id:{$in:group}});
                        if(find_group.errors){
                          console.log('autologin find_grpup errors');
                          output.status=412;
                          res.send(output);
                          return;
                        }
                        output.group=await find_group.map(em=>{
                          return{
                            id:em._doc.id,
                            member:em._doc.member,
                            img:em._doc.img||''
                          }
                        });
                        var find_chatRoom= await database.ChatRoomModel.find({$and:[{player:{$in:[user_id]}},{player:{$nin:block}}]}).sort({updatetime:-1}).limit(200);
                        if(find_chatRoom.errors){
                          console.log('autologin find_chatRoom errors');
                          output.status=411;
                          res.send(output);
                          return;
                        }
                        var user_id_arr_chat=[];
                        output.chatlist=find_chatRoom.map(em=>{
                          for(var i=0;i<2;i++){
                            console.log(em._doc.info[i].user_id);
                            if(em._doc.info[i].user_id!=user_id&&user_id_arr_chat.indexOf(em._doc.info[i].user_id)===-1){
                              user_id_arr_chat.push(em._doc.info[i].user_id);
                            }
                          }
                          return{
                            info:em._doc.info,
                            room:em._doc.room[0],
                            updatetime:em._doc.updatetime
                          }
                        });
                        var find_user_id= await database.UserModel.find({user_id:{$in:user_id_arr_chat}});
                        if(find_user_id.errors){
                          console.log('find_user_id errors');
                          output.status=412;
                          res.send(output);
                          return;
                        }
                        output.user_arr_chat= find_user_id.map(em=>{
                          return{
                            user_id:em._doc.user_id,
                            id:em._doc.id,
                            img:em._doc.img
                          }
                        });
                        console.log(output);
                        if(fcmToken!=0){
                          database.TkModel.update({_id},{tk:fcmToken},(err)=>{
                            if(err){
                              console.log('autologin err');
                              output.status=409;
                              res.send(output);
                              return;
                            }
                            output.status=100;
                            res.send(output);
                          });
                        }else{
                          output.status=100;
                          res.send(output);
                        }
                      }else{
                        console.log('LvModel.find results.length == 0 -->err');
                        output.status=409;
                        res.send(output);
                      }
                    });
                  }else{
                    console.log('FollowModel.find results.length==0 -->err');
                    output.status=408;
                    res.send(output);
                  }
                });
              }else{
                console.log('AlarmModel.find results.length ==0 -->err');
                output.status=406;
                res.send(output);
              }
            })
          }else{
            console.log('autologin: CoinModel.find results.length==0 -->err');
            output.status=404;
            res.send(output);
          }
        });
      }else{
        console.log('autologin: results.length==0 -->err');
        output.status=102;
        res.send(output);
      }
   }); 
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.autologin = autologin;