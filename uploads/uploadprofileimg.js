var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
var config = require('../config');

var uploading = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.profileImgBucket,
    acl: 'public-read',  
    metadata: function (req, file, cb) {
        console.log('upload profile img metadata');
        cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
        console.log('upload profile img key');
        cb(null, Date.now().toString())
    }
  })
});

var uploadprofileimg = function(app){
  app.post('/uploadprofileimg', uploading.array('file',30), function(req, res, next) {
    console.log('aa');
    var files=[];
    req.files.forEach((elm)=>{
      files.push({uri:elm.location,type:elm.mimetype});
    });
    console.log(req.files[0].location);
    var _id = req.body._id||'';
    var output = {}; 
    var database = req.app.get('database');
    if(database){
      database.UserModel.update({_id},{img:req.files[0].location},(err)=>{
        if(err){
          console.log('uloadporfileimg err');
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
  });
}

 module.exports = uploadprofileimg;