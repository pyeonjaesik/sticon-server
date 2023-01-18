var getgroupscreen = async function(req, res) {
  console.log('getgroupscreen');
  const group_id=req.body.group_id||0;
  const user_id=req.body.user_id;
  const _id=req.body._id;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    const find_user = await database.UserModel.find({_id});
    if(find_user.errors||find_user.length!=1){
      console.log('getgroupscreen error');
      output.status=401;
      res.send(output);
      return;
    }
    const ph=find_user[0]._doc.ph||user_id;
    const find_follow = await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('find_follow error');
      output.status=400;
      res.send(output);
      return;
    }
    const block=[...find_follow[0]._doc.block];
    const find_group = await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('getgroupscreen: error');
      output.status=401;
      res.send(output);
      return;
    }
    output.w_i=find_group[0]._doc.wating.findIndex(em=>em.invited==user_id||em.invited==ph)===-1?false:true;
    output.group={
      id:find_group[0]._doc.id,
      img:find_group[0]._doc.img
    }
    let user_id_arr=[];
    output.members=find_group[0]._doc.members.map(em=>{
      user_id_arr.push(em.user_id);
      return em;
    });
    const find_gallery = await database.VideoModel.find({
      groupList:{$in:[group_id]},
      show:{$lt:110},
      report:{$nin:[user_id]},
      user_id:{$nin:block}
    }).sort({ct:-1}).limit(1000);

    if(find_gallery.errors){
      console.log('getgroup find_gallery err');
      output.status=403;
      res.send(output);
      return;
    }

    let post_id_arr=[];
    output.post=await find_gallery.map(em=>{
      user_id_arr.push(em._doc.user_id);
      post_id_arr.push(em._doc._id.toString());
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
      return {
        post_id:em._doc._id,
        cloud:em._doc.cloud,
      }
    });
    const find_user_profile= await database.UserModel.find({user_id:{$in:user_id_arr}});
    if(find_user_profile.errors){
      console.log('getgroupscreen find user profile error');
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
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getgroupscreen = getgroupscreen;