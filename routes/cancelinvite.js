var cancelinvite = async function(req, res) {
  const _id=req.body._id;
  const group_id=req.body.group_id;
  const invited = req.body.invited; 
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    const find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length!=1){
      console.log('cancel invite find user error');
      output.status=401;
      res.send(output);
      return;
    }
    const user_id=find_user[0]._doc.user_id;
    const find_group = await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('cancel invite find group error');
      output.status=402;
      res.send(output);
      return;
    }
    let u_i=find_group[0]._doc.members.findIndex(em=>em.user_id==user_id);
    if(u_i==-1){
      console.log('cancel invite not group member');
      output.status=403;
      res.send(output);
      return;
    }
    let wating = find_group[0]._doc.wating.filter(em=>em.invited!=invited);
    database.GroupModel.update({id:group_id},{wating},(err)=>{
      if(err){
        console.log('cacel invite groupmodel update error');
        output.status=404;
        res.send(output);
        return;
      }
      console.log('cancel invite success')
      output.status=100;
      res.send(output);
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.cancelinvite = cancelinvite;