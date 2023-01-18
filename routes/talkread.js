var talkread = function(req, res) {
  var my_id=req.body.my_id;
  var your_user_id=req.body.your_user_id;
  var text=req.body.text;
  var output={};
  var database = req.app.get('database');
  var socket = req.app.get('socket');
  var io = req.app.get('io');
	if (database.db) {
    database.UserModel.find({_id:my_id},(err,results)=>{
      if(err){
        console.log('talk: UserModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var my_user_id=results[0]._doc.user_id;
        database.ChatRoomModel.find({player: { $all: [ my_user_id, your_user_id ] }},async (err,results)=>{
          if(err){
            console.log('ChatRoomModel.find err');
            output.status=408;
            res.send(output);
            return;
          }
          if(results.length>0){
            var info = results[0]._doc.info;
            var my_f_i = info.findIndex(em=>em.user_id==my_user_id);
            var your_f_i = info.findIndex(em=>em.user_id==your_user_id);
            info=[
              {
                user_id:info[my_f_i].user_id,
                show:true,
                bedge:0
              },
              {
                user_id:info[your_f_i].user_id,
                show:true,
                bedge:(info[your_f_i].bedge)
              }
            ]
            database.ChatRoomModel.update({player:{ $all:[my_user_id,your_user_id]}},{
              info,
            },(err)=>{
              if(err){
                console.log('talk: ChatModel.update err');
                output.status=412;
                res.send(output);
                return;
              }
              database.UserModel.find({user_id:your_user_id},(err,results)=>{
                if(err){
                  console.log('talk: UserModel.find2 err');
                  output.status=404;
                  res.send(output);
                  return;
                }
                if(results.length>0){
                  io.to(results[0]._doc.socket).emit('READ',{
                    user_id:my_user_id
                  });
                  console.log('read talk success');
                  output.status=100;
                  res.send(output);
                }else{
                  console.log('talk:UserModel.find2 results.length ==0 -->err');
                  output.status=405;
                  res.send(output);
                }
              });
            });
          }else{
            output.status=401;
            res.send(output);
          }
        });
      }else{
        console.log('talk: UserModel.find results.length ==0 --> err');
        output.status=402;
        res.send(output);
      }
    });
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.talkread = talkread;