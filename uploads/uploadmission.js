var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
var config = require('../config');

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.galleryBucket,
    acl: 'public-read',  
    metadata: function (req, file, cb) {
        console.log('uploadpost metadata');
        cb(null, {fieldName: file.fieldname});
      
    },
    key: function (req, file, cb) {
        console.log('uploadpost key');
        cb(null, Date.now().toString())
    }
  })
});

var uploadmission = function(app){
  app.post('/uploadmission', upload.array('file',30), function(req, res, next) {
    var files=[];
    req.files.forEach((elm)=>{
      files.push({uri:elm.location,type:elm.mimetype});
    });
    var _id = req.body._id||'';
    var id = req.body.id || '';
    var text = req.body.text || '';
    var post_id=req.body.post_id||0;
    var imagemode=req.body.imagemode||'1';
    var kit=req.body.user_id||'1';
    console.log(`_id:${_id}
    id: ${id}
    text:${text}`);
    console.log('imagemode:'+imagemode);
    var created_time = parseInt(Date.now());
    var output = {}; 
    var database = req.app.get('database');
    if(database){
      var Ms = new database.MsModel({"userid":id,"user_id":_id,"text":text,"created_time":created_time,'post_id':post_id,clip:files,im:imagemode,kit});
      Ms.save(function(err,results){
          if(err){
            output.status = 4;
            res.send(output);
            return;
          }
          if(results){
            output.ms_id=results._doc._id;    
            database.PostModel.findOneAndUpdate({_id:post_id},{$inc:{cn:1}},(err,results)=>{
              if(err){
                console.log('mymission: PostModel.update err');
                output.status=404;
                res.send(output);
                return;
              }
              if(results){
                var user_id=results._doc.user_id;
                var post_txt=results._doc.text.substring(0,30);
                if(_id==user_id){
                  output.status=100;
                  res.send(output);
                }else{
                  database.AlarmModel.find({_id:user_id},(err,results)=>{
                    if(err){
                      console.log('mymission: AlarmModel.update err');
                      output.status=405;
                      res.send(output);
                      return;
                    }
                    if(results.length>0){
                      let a_index=results[0]._doc.alarm.findIndex((em)=>em.type===3 && em.post_id===post_id);
                      var alarm_tmp={
                        post_id:post_id,
                        txt:post_txt,
                        ms_id:a_index===-1?[output.ms_id]:[output.ms_id,...results[0]._doc.alarm[a_index].ms_id],
                        ln:a_index===-1?0:results[0]._doc.alarm[a_index].ln,
                        ct:parseInt(Date.now()),
                        type:3
                      }
                      var alarm=results[0]._doc.alarm
                      var alarm_leng=0;
                      if(a_index===-1){
                        console.log('a_index==-1');
                        alarm.unshift(alarm_tmp);
                        alarm_leng=1;
                      }else{
                        // var alarm =results[0]._doc.alarm.splice(a_index,1,alarm_tmp);
                        alarm.splice(a_index,1);
                        alarm.unshift(alarm_tmp);
                        console.dir(alarm);
                      }
                      database.AlarmModel.update({_id:user_id},{alarm,$inc: { leng: alarm_leng }},(err)=>{
                        if(err){
                          console.log('uploadmission:AlarmMOdle.update err');
                          output.status=408;
                          res.send(output);
                          return;
                        }
                        output.status=100;
                        res.send(output);
                      });
                    }else{
                      console.log('uploadmission: AlarmModel.find results x --> err');
                      output.status=407;
                      res.send(output);
                    }
                  });
                }
              }else{
                console.log('uploadmission: PostModel.findOneAndUpdate results x --> err');
                output.status=405;
                res.send(output);
              }
            });                      
          }else{
            output.status=403;
            res.send(output);    
          }
      }); 
    }else{
      console.log('uploadpost no database');
      output.status=410;
      res.send(output);
    } 
  });
}

 module.exports = uploadmission;