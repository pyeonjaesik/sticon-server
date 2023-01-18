var getgroupgallery = async function(req, res) {
  var _id=req.body._id||'';
  var user_id=req.body.user_id;
  var group_id=req.body.group_id;
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    var find_follow= await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length==0){
      console.log('getgroupgallery find follow err');
      output.status=401;
      res.send(output);
    }
    var block=[...find_follow[0]._doc.block];

    if(find_follow[0]._doc.group.indexOf(group_id)==-1){
      console.log('getgroupgallery not group memeber');
      output.status=402;
      res.send(output);
      return;
    }
    var find_group=await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('gethotgallery find_user_arr find error');
      output.status=404;
      res.send(output);
      return;
    }
    output.group={
      id:find_group[0]._doc.id,
      img:find_group[0]._doc.img,
      members:[...find_group[0]._doc.members],
      wating:[...find_group[0]._doc.wating]
    }
    var user_id_arr_new=await find_group[0].members.map(em=>em.user_id);
    for( let index in find_group[0]._doc.wating){
      user_id_arr_new.push(find_group[0]._doc.wating[index].invited);
    }

    var VideoPost_new= await database.VideoModel.find({
      groupList:{$in:[group_id]},
      show:{$lt:200},
      report:{$nin:[user_id]},
      user_id:{$nin:block}
    }).sort({ct:-1}).limit(1000);

    if(VideoPost_new.errors){
      console.log('VideoPost1 err');
      output.status=403;
      res.send(output);
      return;
    }

    var post_id_arr=[];
    output.post=await VideoPost_new.map(em=>{
      user_id_arr_new.push(em._doc.user_id);
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
        groupList:em._doc.groupList,
        cn:em._doc.cn,
        show:em._doc.show
      }
    });
    var find_comment= await database.CommentModel.find({_id:{$in:post_id_arr}});
    if(find_comment.errors){
      console.log('getgroupgallery: find_comment error');
      output.status=406;
      res.send(output);
      return;
    }
    output.comment= find_comment.map(em=>{
        em._doc.cloud.map(emS=>{
          if(user_id_arr_new.indexOf(emS.user_id)==-1){
            user_id_arr_new.push(emS.user_id)
          }
        });
        return {
          post_id:em._doc._id,
          cloud:em._doc.cloud,
        }
    });

    var find_user_profile= await database.UserModel.find({user_id:{$in:user_id_arr_new}});
    if(find_user_profile.errors){
      console.log('getgroupgallery find user profile error');
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
    console.log(output);
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getgroupgallery = getgroupgallery;