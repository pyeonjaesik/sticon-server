var getreadprofile = async function(req, res) {
  console.log('get read profile');
  var post_id=req.body.post_id||0;
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_video = await database.VideoModel.find({_id:post_id});
    if(find_video.errors||find_video.length==0){
      console.log('get read profile find video errors');
      output.status=401;
      res.send(output);
      return;
    }
    var user_arr_igd= await find_video[0]._doc.read.map(x=>x);
    output.number=user_arr_igd.length;
    var find_user_arr= await database.UserModel.find({user_id:{$in:user_arr_igd}});
    if(find_user_arr.errors){
      console.log('get read profile find_user_arr errors');
      output.status=402;
      res.send(output);
      return;
    }
    output.user_arr = await find_user_arr.map(em=>{
      return{
        id:em._doc.id,
        user_id:em._doc.user_id,
        img:em._doc.img
      }
    });
    console.log(output.user_arr);
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getreadprofile = getreadprofile;