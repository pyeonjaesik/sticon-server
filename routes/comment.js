var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);

var comment = async function(req, res) {
  console.log('comment')
  var _id=req.body._id;
  var post_id=req.body.post_id;
  var text=req.body.text;
  var output={};
  var database = req.app.get('database');
  var io = req.app.get('io');
  var created_time = parseInt(Date.now());
	if (database.db) {
    var find_post= await database.VideoModel.find({_id:post_id});
    if(find_post.errors||find_post.length==0){
      console.log('comment: find_post_err');
      output.status=400;
      res.send(output);
      return;
    }
    var post_user_id=find_post[0]._doc.user_id;
    var io_user_arr=find_post[0]._doc.personList.map(x=>x);
    var group_temp=find_post[0]._doc.groupList.map(x=>x);
    
    var find_post_user= await database.UserModel.find({user_id:post_user_id});
    if(find_post_user.errors||find_post_user.length==0){
      console.log('comment: find_post_user error');
      output.status=400;
      res.send(output);
      return;
    }
    var post_user_profile={
      id:find_post_user[0]._doc.id,
      img:find_post_user[0]._doc.img,
      user_id:post_user_id
    }
    var find_group_user=await database.FollowModel.find({group:{$in:group_temp}});
    if(find_group_user.errors){
      console.log('comment: find_group_user  error');
      output.status=401;
      res.send(output);
      return;
    }
    
    var io_id_arr= await find_group_user.map(em=>em._doc._id.toString());
    if(io_user_arr.indexOf(post_user_id)==-1){
      io_user_arr.push(post_user_id)
    }
    var find_socket= await database.UserModel.find({$or:[{
      user_id:{$in:io_user_arr}
    },{
      _id:{$in:io_id_arr}
    }]});
    console.log(io_id_arr);
    var socket_arr=[];
    await find_socket.map(em=>{
      if(em._doc._id!=_id){
        socket_arr.push(em._doc.socket)
      }
    });
    var find_user = await database.UserModel.find({_id});
    if(find_user.errors||find_user.length==0){
      console.log('comment: find_user error');
      output.status=401;
      res.send(output);
      return;
    }
    var id=find_user[0]._doc.id;
    var img=find_user[0]._doc.img;
    var user_id=find_user[0]._doc.user_id;
    var find_comment = await database.CommentModel.find({_id:post_id});
    if(find_comment.errors){
      console.log('comment: find_comment erorr');
      output.status=402;
      res.send(output);
      return;
    }
    if(post_user_id!=user_id){
      var user_arr=[post_user_id];
    }else{
      var user_arr=[];
    }
    var comment={
      user_id:find_user[0]._doc.user_id,
      text,
      ct:created_time,
    }
    console.log('user_arr');
    console.log(user_arr);
    if(find_comment.length>0){
      await find_comment[0]._doc.player.map(em=>{
        if(user_arr.indexOf(em.user_id)==-1&&em.user_id!=user_id){
          user_arr.push(em.user_id)
        }
      });
      console.log('user_arr!!!!');
      console.log(user_arr);
      var comment_arr=find_comment[0]._doc.comment.map(x=>x);
      var player=find_comment[0]._doc.player.map(x=>x);
      var p_i=player.findIndex(em=>em.user_id==user_id);
      if(p_i==-1){
        player.push({
          user_id,
          read:comment_arr.length+1
        })
      }else{
        player.splice(p_i,1,{
          user_id,
          read:comment_arr.length+1
        })
      }
      database.CommentModel.update({_id:post_id},{$push: { comment: comment},player},async (err)=>{
        if(err){
          console.log('CommentModel.update error');
          output.status=403;
          res.send(output);
          return;
        }
        database.VideoModel.update({_id:post_id},{cn:comment_arr.length+1},async (err)=>{
          if(err){
            console.log('comment: VideoModel.update err');
            output.status=409;
            res.send(output);
            return;
          }
          socket_arr.map(em=>{
            if(em!=''){
              io.to(em).emit('VCHAT',{
                post_id,
                id,
                img,
                user_id,
                text,
                personList:find_post[0]._doc.personList,
                groupList:find_post[0]._doc.groupList,
                post_user_profile
              });
            }
          });
          if(user_arr.length>0){
            output.status=100;
            res.send(output);
            var find_tk= await database.TkModel.find({user_id:{$in:user_arr}});
            if(find_tk.length==0||find_tk.errors){
              console.log('comment: find_tk error');
              return;
            }
            var push_data=[];
            find_tk.map(em=>{
              if(em._doc.tk!='0'){
                push_data.push({
                  to: em._doc.tk,
                  notification: {
                    title: `${id}님의 브이챗`,
                    body:text,
                    sound: "default",
                    icon: "fcm_push_icon"
                  },
                  priority: "high",
                  restricted_package_name: "com.yomencity.puppy",
                  data: {
                    post_id,
                    id,
                    img,
                    user_id,
                    text,
                    type:'vchat'
                  }
                });
              }
            });
            push_data.map(em=>{
              fcm.send(em, function(err, response) {
                if (err) {
                  console.log(err)
                  output.status=700;
                  return;
                }
                console.log('comment: push success')
              }); 
            });
          }else{
            output.status=100;
            res.send(output);
          }
        });
      });
    }else{
      var Comment = new database.CommentModel({
        _id:post_id,
        comment:[comment],
        player:[{
          user_id,
          read:1
        }]
      });
      Comment.save(async (err)=>{
        if(err){
          console.log('comment save err');
          output.status=408;
          res.send(output);
          return;
        }
        database.VideoModel.update({_id:post_id},{cn:1},async (err)=>{
          if(err){
            console.log('VideoModel.udpate err');
            output.status=409;
            res.send(output);
            return;
          }
          socket_arr.map(em=>{
            if(em!=''){
              io.to(em).emit('VCHAT',{
                post_id,
                id,
                img,
                user_id,
                text,
                personList:find_post[0]._doc.personList,
                groupList:find_post[0]._doc.groupList,
                post_user_profile
              });
            }
          })
          output.status = 100;
          res.send(output);
          if(post_user_id==user_id){
            return;
          }
          var find_tk= await database.TkModel.find({user_id:post_user_id});
          if(find_tk.errors||find_tk.length==0){
            console.log('comment: find_tk error');
            return;
          }
          var token=find_tk[0]._doc.tk;
          var push_data={
            to: token,
            notification: {
              title: `${id}님의 브이챗`,
              body:text,
              sound: "default",
              icon: "fcm_push_icon"
            },
            priority: "high",
            restricted_package_name: "com.yomencity.puppy",
            data: {
              post_id,
              id,
              img,
              user_id,
              text,
              type:'vchat'
            }
          }
          fcm.send(push_data, function(err, response) {
            if (err) {
              console.log(err)
              return;
            }
            console.log('comment: push success')
          }); 
        });
      });
    }
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.comment = comment;