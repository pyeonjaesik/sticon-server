var toggleshow = async function(req, res) {
  var _id=req.body._id;
  var show=req.body.show; 
  var post_id=req.body.post_id;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    const find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length!=1){
      console.log('find_user error');
      output.status=401;
      res.send(output);
      return;
    }
    const user_id=find_user[0]._doc.user_id;
    const find_video= await database.VideoModel.find({_id:post_id});
    if(find_video.errors||find_video.length!=1){
      console.log('find_video error');
      output.status=402;
      res.send(output);
      return;
    }
    const group_id=find_video[0]._doc.groupList[0];
    const find_group= await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('find_group error');
      output.status=403;
      res.send(output);
      return;
    }
    const members=[...find_group[0]._doc.members];
    const m_i=members.findIndex(em=>em.user_id==user_id);
    if(m_i===-1){
      console.log('toggle show not group member');
      output.status=404;
      res.send(output);
      return;
    }
    database.VideoModel.update({_id:post_id},{show:parseInt(show)},(err)=>{
      if(err){
        console.log('show toggle error');
        output.status=405;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.toggleshow = toggleshow;