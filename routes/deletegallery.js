var deletegallery = async function(req, res) {
  var _id=req.body._id;
  var post_id=req.body.post_id;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_user_id=await database.UserModel.find({_id});
    if(find_user_id.errors||find_user_id.length==0){
      console.log('report post: find user_id error');
      output.status=402;
      res.send(output);
      return;
    }
    const user_id=find_user_id[0]._doc.user_id;
    var find_video=await database.VideoModel.find({_id:post_id});
    if(find_video.errors||find_video.length==0){
      console.log('report post: find video error');
      output.status=401;
      res.send(output);
      return;
    }
    const group_user_id=find_video[0]._doc.user_id;
    if(group_user_id!=user_id){
      console.log('not gallery host');
      output.status=401;
      res.send(output);
      return;
    }
    database.VideoModel.update({_id:post_id},{show:400},(errors)=>{
      if(errors){
        console.log('delete gallery VideoModel.update err');
        output.status=404;
        res.send(output);
        return;
      }
      console.log('delete success');
      output.status=100;
      res.send(output);
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.deletegallery = deletegallery;