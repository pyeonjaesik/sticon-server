var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
var shortid    = require('shortid');
var admin = require("firebase-admin");
var config = require('../config');

var uploading = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.groupImgBucket,
    acl: 'public-read',  
    metadata: function (req, file, cb) {
        console.log('upload profile img metadata');
        cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        console.log('upload profile img key');
        cb(null, shortid.generate())
    }
  })
});

var makegroup = function(app){
  app.post('/makegroup', uploading.array('file',30), async function(req, res, next) {
    var files=[];
    req.files.forEach((elm)=>{
      files.push({uri:elm.location,type:elm.mimetype});
    });
    var _id = req.body._id||'';
    var member_temp = JSON.parse(req.body.member)||[];
    var name = req.body.name||'';
    var id_query='';
    var id_length=name.length;
    for(var i=0;i<id_length;i++){
      if(i==id_length-1){
        id_query+=name[i];
      }else{
        id_query+=name[i]+' '
  
      }
    } 
    var output = {}; 
    var database = req.app.get('database');
    const io = req.app.get('io');

    if(database){
      var find_user= await database.UserModel.find({_id});
      if(find_user.errors||find_user.length==0){
        console.log('make group: find user error');
        output.status=401;
        res.send(output);
        return;
      }
      const user_id=find_user[0]._doc.user_id;
      const img=find_user[0]._doc.img;
      const id=find_user[0]._doc.id;
      let user_id_arr=[];
      let wating=[];
      member_temp.map(em=>{
        switch(em.type){
          case 'follow':
            if(em.user_id!=user_id){
              user_id_arr.push(em.user_id);
              wating.push({
                status:0,
                inviter:user_id,
                invited:em.user_id,
                ct:parseInt(Date.now())
              });
            }
            break;
          case 'contact':
            user_id_arr.push(em.user_id);
            wating.push({
              status:1,
              inviter:user_id,
              invited:em.user_id,
              name:em.name,
              ct:parseInt(Date.now())
            });
            break;
          default:
            wating.push({
              status:9,
              inviter:user_id,
              invited:em.user_id,
              ct:parseInt(Date.now())
            });
            break;
        }
      });

      var find_group= await database.GroupModel.find({id:name});
      if(find_group.errors||find_group.length>0){
        console.log('makegroup: error or already exist.');
        output.status=401;
        res.send(output);
        return;
      }
      var Group = new database.GroupModel({
        id:name,
        member:1,
        members:[{
          user_id,
          nickname:'',
          nickimg:'',
          status:''
        }],
        id_query,
        img:files[0].uri,
        wating
      });
      Group.save(async (err,result)=>{
        if(err){
          console.log('grouping: Group.save err');
          output.status=407;
          res.send(output);
          return;
        }
        const group_id = result._doc._id;
        output.group_id=group_id;
        database.FollowModel.update({_id},{$push: { group: name.toString() }},async (err)=>{
          if(err){
            console.log('makegroup update error');
            output.status=403;
            res.send(output);
            return;
          }
          const find_users = await database.UserModel.find({$or:[
            {user_id:{$in:user_id_arr}},
            {ph:{$in:user_id_arr}}
          ]});
          if(find_users.errors){
            console.log('makegroup find users error');
            output.status=405;
            res.send(output);
            return;
          }
          let users=find_users.map(em=>em._doc.user_id);
          const find_token= await database.TkModel.find({user_id:{$in:users}});
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
              id:name,
              img:files[0].uri,
              inviter:{
                user_id,
                img,
                id
              },
            });
          });
          console.log('makegroup success')
          output.status = 100;
          res.send(output);
          if(client_tokens.length==0){
            return;
          }
          await admin.messaging().sendToDevice(
            client_tokens, // ['token_1', 'token_2', ...]
            {
              notification: {
                title: id,
                body: `${name} 그룹으로 초대합니다.`,
                sound: "default",
                // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
              },
              data: {
                type:'invitemembers',
                groupid:name,
              },
            },
            {
              // Required for background/quit data-only messages on iOS
              contentAvailable: true,
              // Required for background/quit data-only messages on Android
              priority: 'high',
            },
          );
        })
      });
    }else{
      console.log('makegroup no database');
      output.status=410;
      res.send(output);
    } 
  });
}

 module.exports = makegroup;