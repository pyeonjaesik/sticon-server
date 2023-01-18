var multer = require('multer');
var multerS3 = require('multer-s3');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
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
        cb(null, Date.now().toString())
    }
  })
});

var uploadgroupimg = function(app){
  app.post('/uploadgroupimg', uploading.array('file',30), async function(req, res, next) {
    var files=[];
    req.files.forEach((elm)=>{
      files.push({uri:elm.location,type:elm.mimetype});
    });
    var _id = req.body._id||'';
    var group_id = req.body.group_id||'';
    console.log(_id+'/'+group_id);
    var output = {}; 
    var database = req.app.get('database');
    if(database){
      const find_user= await database.UserModel.find({_id});
      if(find_user.errors||find_user.length!=1){
        console.log('uploadgroupimg: find_user error');
        output.status=401;
        res.send(output);
        return;
      }
      let user_id=find_user[0]._doc.user_id;
      const find_group = await database.GroupModel.find({id:group_id});
      if(find_group.errors||find_group.length!=1){
        console.log('uploadgroupimg: find_group error');
        output.status=402;
        res.send(output);
        return;
      }
      const members=[...find_group[0]._doc.members];
      const m_i=members.findIndex(em=>em.user_id==user_id);
      if(m_i===-1){
        console.log('uploadgroupimg: not group memeber');
        output.status=200;
        res.send(output);
        return;
      }
      database.GroupModel.update({id:group_id},{img:req.files[0].location},(err)=>{
        if(err){
          console.log('uploadgroupimg: upload error');
          output.status=403;
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

 module.exports = uploadgroupimg;