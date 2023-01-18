var getcomment = async function(req, res) {
  console.log('get comment')
  var post_id=req.body.post_id||'';
  var user_id=req.body.user_id||'';
  var output={};
  output.comment=[];
  var database = req.app.get('database');
	if (database.db) {
    var find_comment=await database.CommentModel.find({_id:post_id});
    if(find_comment.errors){
      console.log('find_comment error');
      output.status=401;
      res.send(output);
      return;
    }
    if(find_comment.length==0){
      console.log('find_comment length ==0');
      output.status=100;
      res.send(output);
      return;
    }
    var user_profile=[];
    output.player= await find_comment[0]._doc.player.map(x=>x);
    output.comment= await find_comment[0]._doc.comment.map(em=>{
      if(user_profile.indexOf(em.user_id)==-1){
        user_profile.push(em.user_id);
      }
      return em;
    });
    var find_users = await database.UserModel.find({user_id:{$in:user_profile}});
    if(find_users.errors){
      console.log('getcomment: find_users error');
      output.status=402;
      res.send(output);
      return;
    }
    output.user_arr=await find_users.map(em=>{
      return{
        user_id:em._doc.user_id,
        id:em._doc.id,
        img:em._doc.img,
      }
    });
    //
    //
    var player=find_comment[0]._doc.player.map(x=>x);
    var p_i=player.findIndex(em=>em.user_id==user_id);
    if(p_i==-1){
      player.push({
        user_id,
        read:find_comment[0]._doc.comment.length
      })
    }else{
      player.splice(p_i,1,{
        user_id,
        read:find_comment[0]._doc.comment.length
      })
    }
    database.CommentModel.update({_id:post_id},{player},(err)=>{
      if(err){
        console.log('commentRead: CommnetModel.update error');
        output.status=402;
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
module.exports.getcomment = getcomment;