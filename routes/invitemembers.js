var admin = require("firebase-admin");

var invitemembers = async function(req, res) {
  console.log('invitemembers');
  var _id=req.body._id;
  var selected=req.body.selected;
  var group_id=req.body.group_id;
  var output={};
  const io = req.app.get('io');
  var database = req.app.get('database');
	if (database.db) {
    const find_user = await database.UserModel.find({_id});
    if(find_user.errors||find_user.length!=1){
      console.log('invitememebers find user error');
      output.status=401;
      res.send(output);
      return;
    }
    let user_id= find_user[0]._doc.user_id;
    const id=find_user[0]._doc.id;
    const find_group= await database.GroupModel.find({id:group_id});
    if(find_group.errors||find_group.length!=1){
      console.log('find_group error');
      output.status=401;
      res.send(output);
      return;
    }
    output.group_id=find_group[0]._doc._id;
    let members=[...find_group[0]._doc.members];
    let wating=[...find_group[0]._doc.wating];
    
    let u_i = members.findIndex(em=>em.user_id==user_id);
    if(u_i===-1){
      console.log('not group member');
      output.status=200;
      res.send(output);
      return;
    }
    selected=selected.filter(emP=>{
      let m_i=members.findIndex(emS=>emS.user_id==emP.user_id);
      let w_i=wating.findIndex(emS=>emS.invited==emP.user_id);
      return m_i===-1&&w_i===-1
    });
    let user_arr=[];
    selected=selected.map(em=>{
      switch(em.type){
        case 'follow':
          user_arr.push(em.user_id);
          return {
            status:0,
            inviter:user_id,
            invited:em.user_id,
            ct:parseInt(Date.now())
          }
        case 'contact':
          return {
            status:1,
            inviter:user_id,
            invited:em.user_id,
            name:em.name,
            ct:parseInt(Date.now())
          }
        default:
          return {
            status:9,
            inviter:user_id,
            invited:em.user_id,
            ct:parseInt(Date.now())
          }
      }
    });
    let find_users= await database.UserModel.find({user_id:{$in:user_arr}});
    if(find_users.errors){
      console.log('find_users error');
      output.status=404;
      res.send(output);
      return;
    }
    let new_members=[];
    for(let index in selected){
      if(selected[index].status===0){
        let u_i=find_users.findIndex(em=>em._doc.user_id==selected[index].invited);
        if(u_i!=-1){
          new_members.push({
            ...selected[index],
            profile:{
              id:find_users[u_i]._doc.id,
              img:find_users[u_i]._doc.img,
              user_id:find_users[u_i]._doc.user_id,
              connect:find_users[u_i]._doc.connect
            }
          })
        }
      }else{
        new_members.push(selected[index]);
      }
    }
    selected=[...selected,...wating];
    database.GroupModel.update({id:group_id},{wating:selected},async (err)=>{
      if(err){
        console.log('GroupModel update');
        output.status=403;
        res.send(output);
        return;
      }
      output.new_members=new_members;
      const find_token= await database.TkModel.find({user_id:{$in:user_arr}});
      if(find_token.errors){
        console.log('makegorup findtoken error');
        output.status=404;
        res.send(output);
        return;
      }
      let client_tokens=[];
      find_token.map(em=>{
        client_tokens.push(em._doc.tk);
        io.to(em._doc.socket).emit('WATING',{
          id:group_id,
          img:find_group[0]._doc.img,
          inviter:{
            user_id:find_user[0]._doc.user_id,
            img:find_user[0]._doc.img,
            id:find_user[0]._doc.id
          },
        });
      });
      output.status=100;
      res.send(output);
      if(client_tokens.length==0){
        return;
      }
      await admin.messaging().sendToDevice(
        client_tokens, // ['token_1', 'token_2', ...]
        {
          notification: {
            title: id,
            body: `${group_id} 그룹으로 초대합니다.`,
            sound: "default",
            // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
          },
          data: {
            type:'invitemembers',
            groupid:group_id,
          },
        },
        {
          // Required for background/quit data-only messages on iOS
          contentAvailable: true,
          // Required for background/quit data-only messages on Android
          priority: 'high',
        },
      );
    });
} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.invitemembers = invitemembers;