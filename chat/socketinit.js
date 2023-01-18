var socketinit = async function(server,database,app){
  var database = database;
  var io = require('socket.io')(server);
  await io.on('connection', async function (socket) {
    await app.set('socket', socket);
    await app.set('io', io)
    socket.on('login', function (data) {
      database.UserModel.update({_id:data._id},{
        socket:socket.id,
        connect:{
          on:true,
          time:parseInt(Date.now())
        }
      },async (err)=>{
        if(err){
          console.log('socket login err');
          return;
        }
        database.TkModel.update({_id:data._id},{socket:socket.id},(err)=>{
          if(err){
            console.log('socekt login err - TkModel upate err');
            return;
          }
        });
        database.FollowModel.update({_id:data._id},{socket:socket.id},(err)=>{
          if(err){
            console.log('socekt login err - FollowModel update err');
            return;
          }
        });
        const find_user= await database.UserModel.find({_id:data._id});
        if(find_user.errors||find_user.length!=1){
          console.log('find_user error');
          return;
        }
        const user_id=find_user[0]._doc.user_id;
        const find_members =await database.GroupModel.find({members:{
          $elemMatch:{user_id}
        }});
        if(find_members.errors||find_members.length==0){
          console.log('no group');
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
          return;
        }
        const find_socket = await database.TkModel.find({user_id:{$in:user_id_arr}});
        if(find_socket.errors||find_socket.length===0){
          console.log('socketinit: find_socket error');
          return;
        }
        find_socket.map(em=>{
          io.to(em._doc.socket).emit('CONNECT',{
            user_id,
            on:true
          });
        });
      });
    });

  });
}

 module.exports = socketinit;