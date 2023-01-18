var commentRead = async function(req, res) {
  console.log('commentRead')
  var user_id=req.body.user_id;
  var post_id=req.body.post_id;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_comment=await database.CommentModel.find({_id:post_id});
    if(find_comment.errors||find_comment.length==0){
      console.log('commentRead find.comment error');
      output.status=401;
      res.send(output);
      return;
    }
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
module.exports.commentRead = commentRead;