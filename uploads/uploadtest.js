var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
var config = require('../config');

var uploadtest = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.galleryBucket,
    acl: 'public-read',  
    metadata: function (req, file, cb) {
        console.log('uploadtest: metadata sex');
        cb(null, {fieldName: file.fieldname});
      
    },
    key: function (req, file, cb) {
        console.log('uploads3: key zamzi');
        cb(null, Date.now().toString())
    }
  })
});

var uploading = function(app){
    app.post('/uploadtest', uploadtest.array('file',100), function(req, res, next) {
      console.log('uploadtest sex sex');
      console.dir(req.files);
      // console.log(JSON.stringify(req));
    var output={};
    output.status='100';
    res.send(output);
  });
}

 module.exports = uploading;