var multer = require('multer');
var aws = require('aws-sdk');
var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);
var ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var admin = require("firebase-admin");

var s3 = new aws.S3({});
var fs         = require('fs');
var path       = require('path');
var shortid    = require('shortid');

var bucket = config.galleryBucket;

var upload = multer({
  storage: multer.diskStorage({
      destination: './uploads/files/',
      filename: function (req, file, cb){
        if(file.originalname.indexOf('video')!=-1){
          cb( null, shortid.generate() + '.mp4');
        }else{
          cb( null, shortid.generate());
        }
          // user shortid.generate() alone if no extension is needed
      }
  })
});
var uploadgallery = function(app){
  app.post('/uploadgallery', upload.array('file',30), function(req, res, next) {
    var io = req.app.get('io');
    var key = req.body.key||'';
    var user_id = req.body.user_id||'';
    var text = req.body.text||'';
    var personList=req.body.personList||[];
    var groupList=req.body.groupList||[];
    var show=req.body.show||'all';
    var url_temp=JSON.parse(req.body.url_temp)||[];
    groupList=JSON.parse(groupList);
    var output = {}; 
    var database = req.app.get('database');
    if(database){
      var VIDEO = new database.VideoModel({
        key,
        user_id,
        text,
        clip:url_temp,
        ct:parseInt(Date.now()),
        ut:parseInt(Date.now()),
        personList,
        groupList,
        show:200
      });
      VIDEO.save(async (err,result)=>{
        if(err){
          console.log('upload video: VIDEO.save err');
          console.log(err)
          output.status=401;
          res.send(output);
          return;
        }
        console.log('upload success')
        var post_id = result._doc._id;
        var Comment= new database.CommentModel({
          _id:post_id,
          read:{
            [user_id]:[]
          }
        });
        Comment.save(async(err,result)=>{
          if(err){
            console.log('uploadgallery: Comment.save err');
            output.status=402;
            res.send(output);
            return;
          }
          output.status=100;
          const galleryComp={
            post_id,
            user_id,
            text:undefined,
            clip:url_temp,
            ct:parseInt(Date.now()),
            ut:parseInt(Date.now()),
            ln:0,
            read:[],
            lastRead:undefined,
            groupList,
            cn:0,
            show:200,
          }
          output.galleryComp=galleryComp
          res.send(output);
          var upload_files=req.files;
          var result_files=[];
          var count=0;
          upload_files.map(async (em,index)=>{
            if(em.originalname.indexOf('video')!=-1){
              var compressedPath = 'uploads/files/cp_'+em.filename;
              ffmpeg(em.path)
              .output(compressedPath)
              .setFfmpegPath(ffmpegPath)
              .size('720x?')
              .on('end', function() {
                console.log('[ffmpeg] resizing success');
                fs.readFile(compressedPath, 'base64', function (err, data) {
                  if (!err) {
                    var params = {
                        Bucket      : bucket,
                        Key         : em.filename,
                        Body        : fs.createReadStream(compressedPath),
                        ContentType : em.mimeType,
                        ACL: 'public-read'
                    };
                    s3.putObject(params, function(err, data) {
                      var output={};
                      fs.unlink(`uploads/files/${em.filename}`,()=>{console.log('fsunlink')})
                      fs.unlink(`uploads/files/cp_${em.filename}`,()=>{console.log('fsunlink_new')})
                      if (!err) {
                        var upload_index=parseInt(em.originalname.split('*')[0]);
  
                        result_files[upload_index]=result_files[upload_index]==undefined?{
                          video:`https://${bucket}.s3.ap-northeast-2.amazonaws.com/${em.filename}`,
                        }:{
                          ...result_files[upload_index],
                          video:`https://${bucket}.s3.ap-northeast-2.amazonaws.com/${em.filename}`,
                        }
                        count++;
                        if(upload_files.length==count){
                          finish();
                        }
                      }else {
                        console.log(err);
                        output.status=401;
                      }
                    });
                  }else{
                    var output={};
                    output.status=401;
                    console.log('err!')
                  }
                });
              })
              .run();
            }else{
              await fs.readFile(em.path, 'base64', async function (err, data) {
                if (!err) {
                  var params_tn = {
                      Bucket      : bucket,
                      Key         : em.filename,
                      Body        : fs.createReadStream(em.path),
                      ContentType : em.mimeType,
                      ACL: 'public-read'
                  };
                  await s3.putObject(params_tn, function(err, data) {
                    var output={};
                    fs.unlink(em.path,()=>{console.log(em.originalname+' unlink')})
                    if (!err) {
                      var upload_index=parseInt(em.originalname.split('*')[0]);
                      result_files[upload_index]=result_files[upload_index]==undefined?{
                        image:`https://${bucket}.s3.ap-northeast-2.amazonaws.com/${em.filename}`,
                      }:{
                        ...result_files[upload_index],
                        image:`https://${bucket}.s3.ap-northeast-2.amazonaws.com/${em.filename}`,
                      }
                      count++;
                      if(upload_files.length==count){
                        finish();
                      }
                    }else {
                      console.log(err);
                      output.status=401;
                    }
                  });
                }else{
                  var output={};
                  output.status=401;
                  console.log('err!')
                }
              });
            }
          });
  
          var finish=()=>{
            database.VideoModel.update({_id:post_id},{
              show,
              clip:result_files,
            },async (err)=>{
              if(err){
                console.log('VideoModel.update err');
                return;
              }
              var find_blocked= await database.FollowModel.find({block:{$in:[user_id]}});
              if(find_blocked.errors){
                console.log('getmainpost find_block error');
                output.status=401;
                return;
              }
              var blocked = await find_blocked.map(em=>em._doc._id.toString());
  
              var my_profile= await database.UserModel.find({user_id});
              if(my_profile.errors||my_profile.length==0){
                console.log('uploadvideo my profile find err');
                output.status=407;
                return;
              }
              const id=my_profile[0]._doc.id;
              const galleryComp={
                post_id,
                user_id,
                text:undefined,
                clip:result_files,
                ct:parseInt(Date.now()),
                ut:parseInt(Date.now()),
                ln:0,
                read:[],
                lastRead:undefined,
                groupList,
                cn:0,
                show,
                profile:{
                  id:my_profile[0]._doc.id,
                  img:my_profile[0]._doc.img
                }
              }
              const find_comment= await database.CommentModel.find({_id:post_id});
              if(find_comment.errors||find_comment.length!=1){
                console.log('find_comment error');
                output.status=401;
                return;
              }
              let user_id_arr=[];
              find_comment[0]._doc.cloud.map(emS=>{
                if(user_id_arr.indexOf(emS.user_id)===-1){
                  user_id_arr.push(emS.user_id)
                }
              });
              const cloud={
                read:find_comment[0]._doc.read[user_id]==undefined?[]:find_comment[0]._doc.read[user_id],
                cloud:[...find_comment[0]._doc.cloud]
              }
              const find_user_profile= await database.UserModel.find({user_id:{$in:user_id_arr}});
              if(find_user_profile.errors){
                console.log('uploadgallery find user profile error');
                output.status=405;
                return;
              }
              let user_arr= find_user_profile.map(em=>{
                return{
                  user_id:em._doc.user_id,
                  id:em._doc.id,
                  img:em._doc.img,
                  connect:em._doc.connect||{type:false,time:0}
                }
              });
              const find_members= await database.GroupModel.find({id:groupList[0]});
              if(find_members.errors||find_members.length!=1){
                console.log('upload gallery error');
                output.status=402;
              }
              let member_user_id_arr=[];
              find_members[0]._doc.members.map(em=>{
                if(em.user_id!=user_id){
                  member_user_id_arr.push(em.user_id);
                }
              });
              const find_tk= await database.TkModel.find({
                user_id:{$in:member_user_id_arr},
                _id:{$nin:blocked}
              });
              if(find_tk.errors){
                console.log('upload gallery find tk error');
                output.status=403;
              }
              let client_tokens=[];
              find_tk.map(em=>{ 
                client_tokens.push(em._doc.tk);
                io.to(em._doc.socket).emit('GALLERY',{
                  contents:galleryComp,
                  cloud,
                  user_arr
                });
              });
              if(client_tokens.length==0){
                return;
              }
              admin.messaging().sendToDevice(
                client_tokens, // ['token_1', 'token_2', ...]
                {
                  notification: {
                    title: id,
                    body: `${groupList[0]} 그룹에 새로운 게시물을 업로드하였습니다.`,
                    sound: "default",
                    // icon: "https://puppytest.s3.ap-northeast-2.amazonaws.com/_9cy11fzK"
                  },
                  data: {
                    type:'uploadgallery',
                    groupid:groupList[0],
                    id
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
          }
        });
      }); 
    }else{
      console.log('upload video no database');
      output.status=410;
      res.send(output);
    } 
  });
}

 module.exports = uploadgallery;