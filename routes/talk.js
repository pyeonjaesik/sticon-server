var admin = require("firebase-admin");

var talk = function(req, res) {
  console.log('talk');
  var my_id=req.body.my_id;
  var your_user_id=req.body.your_user_id;
  var text=req.body.text;
  var output={};
  var database = req.app.get('database');
  var io = req.app.get('io');
  var created_time = parseInt(Date.now());

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
        if(my_user_id==your_user_id){
          console.log('my_user_id== your_user_id')
          output.status=500;
          res.send(output);
          return;
        }
        console.log('aaa');
        var my_img =results[0]._doc.img;
        var myid= results[0]._doc.id;
        database.ChatRoomModel.find({player: { $all: [ my_user_id, your_user_id ] }},async (err,results)=>{
          if(err){
            console.log('ChatRoomModel.find err');
            output.status=408;
            res.send(output);
            return;
          }
          if(results.length>0){
            var room = await results[0]._doc.room.map(x=>x);
            room.unshift({
              type:0,
              user_id:my_user_id,
              text,
              ct:created_time
            });
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
                bedge:(info[your_f_i].bedge+1)
              }
            ]
            var your_bedge=info[1].bedge;
            database.ChatRoomModel.update({player:{ $all:[my_user_id,your_user_id]}},{
              room,
              info,
              updatetime:created_time
            },(err)=>{
              if(err){
                console.log('talk: ChatModel.update err');
                output.status=412;
                res.send(output);
                return;
              }
              database.UserModel.find({user_id:your_user_id},async (err,results)=>{
                if(err){
                  console.log('talk: UserModel.find2 err');
                  output.status=404;
                  res.send(output);
                  return;
                }
                if(results.length>0){
                  console.log('array')
                  io.to(results[0]._doc.socket,results[0]._doc.socket).emit('CHAT',{
                    user_id:my_user_id,
                    text,
                    id:myid,
                    img:my_img,
                    bedge:your_bedge,
                    type:0
                  });
                  console.log('talk success');
                  output.status=100;
                  res.send(output);
                  var find_tk= await database.TkModel.find({user_id:your_user_id});
                  if(find_tk.errors){
                    console.log('talk find token err');
                    output.status=401;
                    res.send(output);
                    return;
                  }
                  var client_token=find_tk[0]._doc.tk;
                  await admin.messaging().sendToDevice(
                    [client_token], // ['token_1', 'token_2', ...]
                    {
                      notification: {
                        title: myid,
                        body: text,
                        sound: "default",
                        icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
                      },
                      data: {
                        type:'message',
                        myid,
                        text,
                      },
                    },
                    {
                      // Required for background/quit data-only messages on iOS
                      contentAvailable: true,
                      // Required for background/quit data-only messages on Android
                      priority: 'high',
                    },
                  );
                }else{
                  console.log('talk:UserModel.find2 results.length ==0 -->err');
                  output.status=405;
                  res.send(output);
                }
              });
            });
          }else{
              // 이 부분은 사실 에러다... 
            var ChatRoom = new database.ChatRoomModel({
              player:[my_user_id,your_user_id],
              info:[
                {
                  user_id:my_user_id,
                  show:true,
                  bedge:0
                },
                {
                  user_id:your_user_id,
                  show:true,
                  bedge:1
                }
              ],
              room:[
                {
                  type:0,
                  user_id:my_user_id,
                  text,
                  ct:created_time
                }
              ],
              updatetime:created_time
            });
            ChatRoom.save((err)=>{
              if(err){
                console.log('talk: ChatRoom.save err');
                output.status=407;
                res.send(output);
                return;
              }
              database.UserModel.find({user_id:your_user_id},async (err,results)=>{
                if(err){
                  console.log('talk: UserModel.find2 err');
                  output.status=404;
                  res.send(output);
                  return;
                }
                if(results.length>0){
                  io.to(results[0]._doc.socket).emit('CHAT',{
                    user_id:my_user_id,
                    text,
                    id:myid,
                    img:my_img,
                    type:0
                  });
                  console.log('talk success');
                  output.status=100;
                  res.send(output);
                  var find_tk= await database.TkModel.find({user_id:your_user_id});
                  if(find_tk.errors){
                    console.log('talk find token err');
                    output.status=401;
                    res.send(output);
                    return;
                  } 
                  var client_token=find_tk[0]._doc.tk;
                  await admin.messaging().sendToDevice(
                    [client_token], // ['token_1', 'token_2', ...]
                    {
                      notification: {
                        title: myid,
                        body: text,
                        sound: "default",
                        icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
                      },
                      data: {
                        type:'message',
                        myid,
                        text,
                      },
                    },
                    {
                      // Required for background/quit data-only messages on iOS
                      contentAvailable: true,
                      // Required for background/quit data-only messages on Android
                      priority: 'high',
                    },
                  );
                }else{
                  console.log('talk:UserModel.find2 results.length ==0 -->err');
                  output.status=405;
                  res.send(output);
                }
              });
            });
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
module.exports.talk = talk;