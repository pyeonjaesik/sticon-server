var gethotgallery = async function(req, res) {
  var _id=req.body._id||'';
  var user_id=req.body.user_id;
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    var find_follow= await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length==0){
      console.log('gethotgallery find follow err');
      output.status=401;
      res.send(output);
    }
    var user_id_arr=[...find_follow[0]._doc.follow];
    var block=[...find_follow[0]._doc.block]
    var group_arr=[...find_follow[0]._doc.group];
    var find_friend= await database.FollowModel.find({group:{$in:group_arr}});
    if(find_friend.errors){
      console.log('gethotgallery find_friend error');
      output.status=400;
      res.send(output);
      return;
    }
    var friend_id_arr=[];
    for(let index in find_friend){
      friend_id_arr.push(find_friend[index]._doc._id)
    }
    var find_contact= await database.ContactsModel.find({_id});
    if(find_contact.errors||find_contact.length==0){
      console.log('gethotgallery find contact error');
      output.status=402;
      res.send(output);
      return;
    }
    var contacts=find_contact[0]._doc.contacts.map(em=>em.ph);
    var find_user_arr= await database.UserModel.find({$or:[
      {_id:{$in:friend_id_arr}},
      {ph:{$in:contacts}}
    ]});
    if(find_user_arr.errors){
      console.log('gethotgallery find_user_arr find error');
      output.status=403;
      res.send(output);
      return;
    }
    for(let index in find_user_arr){
      if(user_id_arr.indexOf(find_user_arr[index]._doc.user_id)!=-1){
        user_id_arr.push(find_user_arr[index]._doc.user_id);
      }
    }
    var find_group_arr=await database.GroupModel.find({
      $and:[
        {id:{$nin:group_arr}},
        {    
          members:{
            $elemMatch:{
              user_id:{$in:user_id_arr}
            }
          }
        }
      ]
    });
    if(find_group_arr.errors){
      console.log('gethotgallery find_user_arr find error');
      output.status=404;
      res.send(output);
      return;
    }
    var group_id_arr=[];
    for(let index in find_group_arr){
      group_id_arr.push(find_group_arr[index].id);
    }
    output.group_arr=find_group_arr.map(em=>{
      return{
        id:em._doc.id,
        img:em._doc.img,
        members:em._doc.members
      }
    });
    var VideoPost_new= await database.VideoModel.find({
      groupList:{$in:group_id_arr},
      show:{$lt:110},
      report:{$nin:[user_id]},
      user_id:{$nin:block}
    }).sort({ut:-1}).limit(500);

    if(VideoPost_new.errors){
      console.log('VideoPost1 err');
      output.status=403;
      res.send(output);
      return;
    }
    var user_id_arr_new=[];
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
        lastRead:em._doc.lastRead,
        groupList:em._doc.groupList,
        cn:em._doc.cn,
        show:em._doc.show
      }
    });
    var find_comment= await database.CommentModel.find({_id:{$in:post_id_arr}});
    if(find_comment.errors){
      console.log('gethotgallery: find_comment error');
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
    console.log(output);
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.gethotgallery = gethotgallery;