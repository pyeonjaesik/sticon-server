var videoread = async function(req,res){
  console.log('videoread')
  var _id = req.body._id||0;
  var video_id=req.body.video_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    var data_user=await database.UserModel.find({_id});
    if(data_user.errors||data_user.length!==1){
      console.log('videoread: UserModel.find err');
      output.status=401;
      res.send(output);
      return;
    }
    var user_id=data_user[0]._doc.user_id
    var data_video=await database.VideoModel.find({_id:video_id});
    if(data_video.errors){
      console.log('videoread: VideoModel.find err');
      output.status=401;
      res.send(output);
      return;
    }
    var read_arr=data_video[0]._doc.read;
    if(read_arr.indexOf(user_id)==-1){
      read_arr.unshift(user_id);
      var update=await database.VideoModel.update({_id:video_id},{read:read_arr});
      console.log('videoread')
      output.status=100;
      res.send(output);
    }else{
      console.log('already video read')
      output.status=102;
      res.send(output);
    }
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.videoread = videoread;