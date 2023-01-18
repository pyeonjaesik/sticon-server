var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var ffmpeg = require('ffmpeg');

var s3 = new aws.S3({});

var ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

var fs         = require('fs');
var path       = require('path');
var shortid    = require('shortid');
var config = require('../config');

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

var uploading = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'puppytest',
    acl: 'public-read',  
    metadata: function (req, file, cb) {
      console.log(req);
        // try {
        //   new ffmpeg('/path/to/your_movie.avi', function (err, video) {
        //     if (!err) {
        //       console.log('The video is ready to be processed');
        //     } else {
        //       console.log('Error: ' + err);
        //     }
        //   });
        // } catch (e) {
        //   console.log(e.code);
        //   console.log(e.msg);
        // }
        console.log('upload profile video metadata');
        cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        console.log('upload profile video key');
        cb(null, Date.now().toString()+'.mp4')
    }
  })
});

var uploadprofilevideo = function(app){
  app.post('/uploadprofilevideo', upload.single('file'), function(req, res, next) {
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
              console.log('uploadprofilevideo');
              var _id = req.body._id||'';
              var output = {}; 
              var database = req.app.get('database');
              if(database){
                database.UserModel.update({_id},{video:aws_location},(err)=>{
                  if(err){
                    console.log('uloadporfilevideo err');
                    output.status=401;
                    res.send(output);
                    return;
                  }
                  output.status=100;
                  res.send(output);
                });
              }else{
                console.log('uploadpost no database');
                output.status=410;
                res.send(output);
              } 
            }else {
              console.log(err);
              output.status=401;
              res.send(output);
            }
          });
        }else{
          var output={};
          output.status=401;
          res.send(output);
          console.log('err!')
        }
      });
    })
    .run();
  });
}

 module.exports = uploadprofilevideo;