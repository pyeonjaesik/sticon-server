var getmainpost140 = function(req, res) {
  var _id=req.body._id||'';
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({_id},(err,results)=>{
      if(err){
        console.log('getmainpost: UserModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var user_id=results[0]._doc.user_id;
        database.FollowModel.find({_id},async (err,results)=>{
          if(err){
            console.log('getmainpost FollowModel.find err');
            output.status=403;
            res.send(output);
            return;
          }
          if(results.length>0){
            var groupList=await results[0]._doc.group.map(x=>x);
            var block=await results[0]._doc.block.map(x=>x);
            var VideoPost_new= await database.VideoModel.find({$or:[{
              personList:{$in:[user_id]}
            },{
              groupList:{$in:groupList}
            },{
              user_id
            }],show:{$lt:200},report:{$nin:[user_id]},user_id:{$nin:block}}).sort({ct:-1}).limit(500);
            if(VideoPost_new.errors){
              console.log('VideoPost1 err');
              output.status=406;
              res.send(output);
              return;
            }
            var user_id_arr=[];
            output.post=await VideoPost_new.map(em=>{
              user_id_arr.push(em._doc.user_id);
              user_id_arr=user_id_arr.concat(em._doc.personList);
              return{
                post_id:em._doc._id.toString(),
                user_id:em._doc.user_id,
                text:em._doc.text,
                roll:em._doc.roll,
                ct:em._doc.ct,
                ln:em._doc.ln,
                read:em._doc.read,
                lastRead:em._doc.lastRead,
                personList:em._doc.personList,
                groupList:em._doc.groupList,
                cn:em._doc.cn,
                show:em._doc.show
              }
            });
            var my_video_find= await database.VideoModel.find({show:200,user_id});
            if(my_video_find.errors){
              console.log('get mainpost my videomodel.find error');
              output.status=420;
              res.send(output);
              return;
            }
            if(my_video_find.length>0){
              my_video_find.map(em=>{
                user_id_arr.push(em._doc.user_id);
                user_id_arr=user_id_arr.concat(em._doc.personList);
                output.post.unshift({
                  post_id:em._doc._id.toString(),
                  user_id:em._doc.user_id,
                  text:em._doc.text,
                  roll:em._doc.roll,
                  ct:em._doc.ct,
                  ln:em._doc.ln,
                  read:em._doc.read,
                  lastRead:em._doc.lastRead,
                  personList:em._doc.personList,
                  groupList:em._doc.groupList,
                  cn:em._doc.cn,
                  show:em._doc.show
                })
              })
            }
            if(output.post.length==0){
              console.log('no post');
              output.status=102;
              res.send(output);
              return;
            }
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
                });
                console.log(output);
                output.status=100;
                res.send(output);
              }else{
                console.log('UserModel.find with user_id_arr-->err');
                output.status=403;
                res.send(output);
              }
            });
          }else{
            console.log('FollowModel.find results.length ==0 -->err');
            output.status=404;
            res.send(output);
          }
        }).sort({ct:-1});
      }else{
        console.log("UserModel.find results.length ==0 -->err");
        output.status=402;
        res.send(output);
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getmainpost140 = getmainpost140;