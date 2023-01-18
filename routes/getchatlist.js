var getchatlist = function(req, res) {
  console.log('get chat list');
  var _id=req.body._id||'';
  console.log('_id:'+_id)
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({_id},(err,results)=>{
      if(err){
        console.log('get chat list err1');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var user_id=results[0]._doc.user_id;
        database.ChatRoomModel.find({player:{$in:[user_id]}},async (err,results)=>{
          if(err){
            console.log('get chat list err2');
            output.status=401;
            res.send(output);
            return;
          }
          if(results.length>0){
            var user_id_arr=[];
            output.post=results.map(em=>{
              for(var i=0;i<2;i++){
                console.log(em._doc.info[i].user_id);
                if(em._doc.info[i].user_id!=user_id&&user_id_arr.indexOf(em._doc.info[i].user_id)===-1){
                  user_id_arr.push(em._doc.info[i].user_id);
                }
              }
              return{
                info:em._doc.info,
                room:em._doc.room[0],
                updatetime:em._doc.updatetime
              }
            });
            console.log(output.post[0].info)
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
                })
                console.log(output);
                output.status=100;
                res.send(output);
              }else{
                console.log(user_id_arr);
                console.log('UserModel.find with user_id_arr-->err');
                output.status=403;
                res.send(output);
              }
            });
          }else{
            console.log('get chat list length ==0');
            output.status=100;
            res.send(output);
            return;
          }
        }).sort({updatetime:-1}).limit(200);
      }else{
        console.log('get chat list: userModel.find results.length ==0 -->err');
        output.status=402;
        res.send(output);
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getchatlist = getchatlist;