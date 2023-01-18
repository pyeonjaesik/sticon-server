var disconnect = function(req, res) {
  var output={};
  var _id = req.body._id||0;
  var io = req.app.get('io');
  var database = req.app.get('database');
	if (database.db) {
    database.UserModel.update({_id},{
      connect:{
        on:false,
        time:parseInt(Date.now())
      }
    },async (err)=>{
      if(err){
        console.log('disconnect: update err');
        output.status=401;
        res.send(output);
        return;
      }
      const find_user= await database.UserModel.find({_id:_id});
      if(find_user.errors||find_user.length!=1){
        console.log('find_user error');
        output.status=401;
        res.send(output);
        return;
      }
      const user_id=find_user[0]._doc.user_id;
      const find_members =await database.GroupModel.find({members:{
        $elemMatch:{user_id}
      }});
      if(find_members.errors||find_members.length==0){
        console.log('no group');
        output.status=200;
        res.send(output);
        return;
      }
      let user_id_arr=[];
      for(let i in find_members){
        let members=[...find_members[i]._doc.members];
        for(let j in members){
          if(members[j].user_id!=user_id&&user_id_arr.indexOf(members[j].user_id)===-1){
            user_id_arr.push(members[j].user_id);
          }
        }
      }
      if(user_id_arr.length==0){
        console.log('group exist but no friend');
        output.status=201;
        res.send(output);
        return;
      }
      const find_socket = await database.TkModel.find({user_id:{$in:user_id_arr}});
      if(find_socket.errors||find_socket.length===0){
        console.log('socketinit: find_socket error');
        output.status=402;
        res.send(output);
        return;
      }
      output.status=100;
      res.send(output);
      find_socket.map(em=>{
        io.to(em._doc.socket).emit('CONNECT',{
          user_id,
          on:false
        });
      });

    })
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.disconnect = disconnect;