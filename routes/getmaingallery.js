var getmaingallery = async function(req, res) {
  var _id=req.body._id||'';
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length!=1){
      console.log('getmaingallery error');
      output.status=401;
      res.send(output);
      return;
    }
    var user_id=find_user[0]._doc.user_id;

    var find_follow= await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('getmainpost FollowModel.find err');
      output.status=402;
      res.send(output);
      return;
    }
    var groupList=await find_follow[0]._doc.group.map(x=>x);
    var block=await find_follow[0]._doc.block.map(x=>x);
    var VideoPost_new= await database.VideoModel.find({
      groupList:{$in:groupList},
      show:{$lt:200},
      report:{$nin:[user_id]},
      user_id:{$nin:block}
    }).sort({ct:-1}).limit(500);
    if(VideoPost_new.errors){
      console.log('VideoPost1 err');
      output.status=403;
      res.send(output);
      return;
    }
    var user_id_arr=[];
    output.post=await VideoPost_new.map(em=>{
      user_id_arr.push(em._doc.user_id);
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
    var my_video_find= await database.VideoModel.find({
      show:200,
      user_id,
      ct:{$gt:(parseInt(Date.now())-(1000*60*60))},
      groupList:{$in:groupList}
    });
    if(my_video_find.errors){
      console.log('get mainpost my videomodel.find error');
      output.status=420;
      res.send(output);
      return;
    }
    if(my_video_find.length>0){
      my_video_find.map(em=>{
        user_id_arr.push(em._doc.user_id);
        output.post.unshift({
          post_id:em._doc._id.toString(),
          user_id:em._doc.user_id,
          text:em._doc.text,
          roll:em._doc.roll,
          clip:em._doc.clip,
          ct:em._doc.ct,
          ut:em._doc.ut,
          ln:em._doc.ln,
          read:em._doc.read,
          lastRead:em._doc.lastRead,
          groupList:em._doc.groupList,
          cn:em._doc.cn,
          show:em._doc.show
        })
      })
    }

    var find_group_user_arr= await database.GroupModel.find({id:{$in:groupList}});
    if(find_group_user_arr.errors){
      console.log('find_group_user_arr');
      output.status=404;
      res.send(output);
      return;
    }
    var memberList={};
    find_group_user_arr.map(emP=>{
      emP._doc.members.map(emS=>{
        if(user_id_arr.indexOf(emS.user_id)==-1){
          user_id_arr.push(emS.user_id)
        }
        if(emS.user_id!=user_id){
          if(memberList[emP.id]==undefined){
            memberList[emP.id]=[emS.user_id]
          }else{
            memberList[emP.id].push(emS.user_id)
          }
        }
      });
      emP._doc.wating.map(emS=>{
        if(emS.status===0&&user_id_arr.indexOf(emS.invited)==-1){
          user_id_arr.push(emS.invited)
        }
      });
    });
    output.group_arr=find_group_user_arr.map(em=>{
      return{
        id:em.id,
        img:em.img,
        member:em.member,
        wating:[...em.wating]
      }
    });
    var post_id_arr=output.post.map(em=>em.post_id);

    var find_comment= await database.CommentModel.find({_id:{$in:post_id_arr}});
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
    var find_user_profile= await database.UserModel.find({user_id:{$in:user_id_arr}});
    if(find_user_profile.errors){
      console.log('getmaingallery find user profile error');
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
    var memberList_result={};
    for(var key in memberList){
      memberList[key].map(emP=>{
        var u_i=output.user_arr.findIndex(emS=>emS.user_id==emP);
        if(u_i!=-1){
          if(memberList_result[key]==undefined){
            memberList_result[key]=[output.user_arr[u_i]]
          }else{
            memberList_result[key].push(output.user_arr[u_i])
          }
        }
      })
    }
    output.memberList=memberList_result;
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getmaingallery = getmaingallery;