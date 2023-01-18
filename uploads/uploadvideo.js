var multer = require('multer');
var aws = require('aws-sdk');
var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);
var ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
var config = require('../config');

var s3 = new aws.S3({});
var fs         = require('fs');
var path       = require('path');
var shortid    = require('shortid');

var bucket = config.galleryBucket;

var upload = multer({
  storage: multer.diskStorage({
      destination: './uploads/files/',
      filename: function (req, file, cb){
        console.log('upload@@')
          // user shortid.generate() alone if no extension is needed
          cb( null, shortid.generate() + '.mp4');
      }
  })
});
var uploadvideo = function(app){
  app.post('/uploadvideo', upload.single('file'), function(req, res, next) {
    var io = req.app.get('io');

    var key = req.body.key||'';
    var user_id = req.body.user_id||'';
    var text = req.body.text||'';
    var personList=req.body.personList||[];
    var groupList=req.body.groupList||[];
    var show=req.body.show||'all';
    var url_temp=req.body.url_temp||'0';

    personList=JSON.parse(personList);
    groupList=JSON.parse(groupList);
    var output = {}; 
    var database = req.app.get('database');
    if(database){
      var VIDEO = new database.VideoModel({
        key,
        user_id,
        text,
        roll:url_temp,
        ct:parseInt(Date.now()),
        ut:parseInt(Date.now()),
        personList,
        groupList,
        show:200
      });
      VIDEO.save(async (err,result)=>{
        if(err){
          console.log('upload video: VIDEO.save err');
          output.status=401;
          res.send(output);
          return;
        }
        console.log('upload success')
        output.status=100;
        res.send(output);

        var post_id = result._doc._id;
        var fileInfo = path.parse(req.file.filename);
        var videoPath = 'uploads/files/' + fileInfo.name+'_new' + '.mp4';
    
        ffmpeg(req.file.path)
        .output(videoPath)
        .setFfmpegPath(ffmpegPath)
        .size('720x?')
        .on('end', function() {
          console.log('[ffmpeg] processing done');
          fs.readFile(videoPath, 'base64', function (err, data) {
            if (!err) {
              var params = {
                  Bucket      : bucket,
                  Key         : fileInfo.name+'.mp4',
                  Body        : fs.createReadStream(videoPath),
                  ContentType : 'video/mp4',
                  ACL: 'public-read'
              };
              s3.putObject(params, function(err, data) {
                var output={};
                fs.unlink(`uploads/files/${fileInfo.name}.mp4`,()=>{console.log('fsunlink')})
                fs.unlink(`uploads/files/${fileInfo.name}_new.mp4`,()=>{console.log('fsunlink_new')})
    
                if (!err) {
                  var aws_location=`https://puppytest.s3.ap-northeast-2.amazonaws.com/${fileInfo.name}.mp4`;
                  database.VideoModel.update({_id:post_id},{
                    show,
                    roll:aws_location
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
                    var myid=my_profile[0]._doc.id;
                    var myimg=my_profile[0]._doc.img;
                    var my_id=my_profile[0]._doc._id.toString();
                    var group_id_arr=[];
                    if(groupList.length!==0){
                      var find_group_id= await database.FollowModel.find({group:{$in:groupList},_id:{$ne:my_id}}).limit(500);
                      if(find_group_id.errors){
                        console.log('upload video find_group_user_id err');
                        output.status=701;
                        return;
                      }
                      console.log('group_id')
                      console.log(find_group_id);
                      var _id_arr=[];
                      group_id_arr=await find_group_id.map(emP=>{
                        let group_in=[];
                        groupList.map(emX=>{
                          if(emP._doc.group.indexOf(emX)!=-1){
                            group_in.push(emX);
                          }
                        });
                        _id_arr.push(emP._doc._id);
                        return{
                          _id:emP._doc._id.toString(),
                          group:group_in,
                          individual:false
                        }
                      });
                      
                      var find_group_tk=await database.TkModel.find({$and:[{_id:{$in:_id_arr}},{_id:{$nin:blocked}}]});
                      if(find_group_tk.errors){
                        console.log('upload video find_group_tk error');
                        output.status=703;
                        return;
                      }
                      await find_group_tk.map(emZ=>{
                        var t_i=group_id_arr.findIndex(emS=>emS._id==emZ._doc._id.toString());
                        if(t_i!=-1){
                          group_id_arr.splice(t_i,1,{
                            ...group_id_arr[t_i],
                            token:emZ._doc.tk,
                            socket:emZ._doc.socket
                          })
                        }else{
                          console.log('group_tk_arr map error 1');
                        }
                      });
                    }
                    if(personList.length!==0){
                      //
                      var find_user_tk= await database.TkModel.find({$and:[{user_id:{$in:personList}},{_id:{$nin:blocked}}]});
                      if(find_user_tk.errors){
                        console.log('upload video find user tk errors');
                        output.status=406;
                        return;
                      }
                      find_user_tk.map(emR=>{
                        var r_i=group_id_arr.findIndex(emW=>emW._id==emR._doc._id.toString());
                        if(r_i!=-1){
                          group_id_arr.splice(r_i,1,{
                            ...group_id_arr[r_i],
                            individual:true
                          })
                        }else{
                          group_id_arr.push({
                            _id:emR._doc._id.toString(),
                            token:emR._doc.tk,
                            socket:emR._doc.socket,
                            individual:true,
                          })
                        }
                      });
                    }
                    var push_data=[];
                    var socket_arr=[];
                    group_id_arr.map(em=>{
                      if(em.token!='0'){
                        let body='';
                        if(em.individual===true){
                          body='회원님에게 영상메시지를 보냈습니다.'
                        }else{
                          for(var i=0;i<em.group.length;i++){
                            if(i===0){
                              body+='@'+em.group[i];
                            }else{
                              body+=' @'+em.group[i];
                            }
                          }
                          body+=' 로 영상메시지를 보냈습니다.'
                        }
                        push_data.push({
                          to: em.token,
                          notification: {
                            title: my_profile[0]._doc.id,
                            body,
                            sound: "default",
                            icon: "fcm_push_icon"
                          },
                          priority: "high",
                          restricted_package_name: "com.yomencity.puppy",
                          data: {
                            id:my_profile[0]._doc.id,
                            img:my_profile[0]._doc.img,
                            text,
                            group:em.group!=undefined||em.group!=null?em.group:[],
                            individual:em.individual,
                            type:'message'
                          }
                        });
                      }
                      if(em.socket!='0'||em.socket!=undefined){
                        socket_arr.push({
                          to:em.socket,
                          group:em.group!=undefined||em.group!=null?em.group:[],
                          individual:em.individual,
                        })
                      }
                    });
                    socket_arr.map(em=>{
                      io.to(em.to).emit('VIDEO',{
                        post_id,
                        user_id,
                        id:myid,
                        img:myimg,
                        groupList:em.group,
                        individual:em.individual
                      });
                    })
                    push_data.map(em=>{
                      fcm.send(em, function(err, response) {
                        if (err) {
                          console.log(err)
                          output.status=700;
                          return;
                        }
                        console.log('talk: push success')
                      }); 
                    })
                  });
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
      }); 
    }else{
      console.log('upload video no database');
      output.status=410;
      res.send(output);
    } 
  });
}

 module.exports = uploadvideo;