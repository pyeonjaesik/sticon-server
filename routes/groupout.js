var groupout = async function(req,res){
  var _id = req.body._id||0;
  var group_id= req.body.group_id||'';
  var database = req.app.get('database');    
  var output ={};
  if(database){
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length!=1){
      console.log('groupagree');
      output.status=401;
      res.send(output);
      return;
    }
    var user_id=find_user[0]._doc.user_id;
    var find_group=await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('group agree: find_group error');
      output.status=402;
      res.send(output);
      return;
    }
    let members=[...find_group[0]._doc.members];
    const m_i=members.findIndex(em=>em.user_id==user_id);
    if(m_i===-1){
      console.log('uploadgroupimg: not group memeber');
      output.status=200;
      res.send(output);
      return;
    }
    members.splice(m_i,1);
    const find_follow=await database.FollowModel.find({_id});
    if(find_follow.errors||find_follow.length!=1){
      console.log('find_follow errors');
      output.status=403;
      res.send(output);
      return;
    }
    let group = [...find_follow[0]._doc.group];
    const g_i=group.indexOf(group_id);
    if(g_i!=-1){
      console.log('group splice in follow Model');
      group.splice(g_i,1);
    }
    database.FollowModel.update({_id},{group},(err)=>{
      if(err){
        console.log('groupout FollowModel.update error');
        output.status=404;
        res.send(output);
        return;
      }
      database.GroupModel.update({id:group_id},{members},(err)=>{
        if(err){
          console.log('groupout GroupModel.update error');
          output.status=405;
          res.send(output);
          return;
        }
        output.status=100;
        res.send(output);
      });
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.groupout = groupout;