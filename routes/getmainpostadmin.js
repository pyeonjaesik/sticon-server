var getmainpostadmin = async function(req, res) {
  console.log('getmainpostadmin')
  var _id=req.body._id||'';
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    var VideoPost_new= await database.VideoModel.find({}).sort({ct:-1}).limit(500);
    if(VideoPost_new.errors){
      console.log('VideoPost1 err');
      output.status=406;
      res.send(output);
      return;
    }
    var user_id_arr=[];
    output.post=await VideoPost_new.map(em=>{
      user_id_arr.push(em._doc.user_id);
      user_id_arr=user_id_arr.concat(em._doc.personList);
      return{
        post_id:em._doc._id.toString(),
        user_id:em._doc.user_id,
        text:em._doc.text,
        roll:em._doc.roll,
        ct:em._doc.ct,
        ln:em._doc.ln,
        read:em._doc.read,
        lastRead:em._doc.lastRead,
        personList:em._doc.personList,
        groupList:em._doc.groupList,
        cn:em._doc.cn,
        show:em._doc.show
      }
    });
    if(output.post.length==0){
      console.log('no post');
      output.status=102;
      res.send(output);
      return;
    }
    database.UserModel.find({user_id:{$in:user_id_arr}},(err,results)=>{
      if(err){
        console.log('UserModel.find err');
        output.status=403;
        res.send(output);
        return;
      }
      if(results.length>0){
        output.user_arr= results.map(em=>{
          return{
            user_id:em._doc.user_id,
            id:em._doc.id,
            img:em._doc.img
          }
        });
        console.log(output);
        output.status=100;
        res.send(output);
      }else{
        console.log('UserModel.find with user_id_arr-->err');
        output.status=403;
        res.send(output);
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getmainpostadmin = getmainpostadmin;