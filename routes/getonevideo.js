var getonevideo = async function(req, res) {
  console.log('getonevideo')
  var post_id=req.body.post_id||'';
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_video = await database.VideoModel.find({_id:post_id});
    if(find_video.errors||find_video.length==0){
      console.log('getonevideo find video error');
      output.status=401;
      res.send(output);
      return;
    }
    var user_arr=[];
    user_arr= await find_video[0]._doc.personList.map(x=>x);
    user_arr.push(find_video[0]._doc.user_id);
    var find_user= await database.UserModel.find({user_id:{$in:user_arr}});
    if(find_user.errors){
      console.log('get one video error');
      output.status=402;
      res.send(output);
      return;
    }
    output.user_arr=find_user.map(em=>{
      return{
        user_id:em._doc.user_id,
        id:em._doc.id,
        img:em._doc.img
      }
    });
    
    output.video={
      post_id:find_video[0]._doc._id.toString(),
      user_id:find_video[0]._doc.user_id,
      text:find_video[0]._doc.text,
      roll:find_video[0]._doc.roll,
      ct:find_video[0]._doc.ct,
      ln:find_video[0]._doc.ln,
      read:find_video[0]._doc.read,
      lastRead:find_video[0]._doc.lastRead,
      personList:find_video[0]._doc.personList,
      groupList:find_video[0]._doc.groupList,
      cn:find_video[0]._doc.cn,
      show:find_video[0]._doc.show
    }
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getonevideo = getonevideo;