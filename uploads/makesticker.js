var multer = require('multer');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
var shortid    = require('shortid');
var config = require('../config');
const resizeImg = require('resize-img');
const fs = require('fs');
const bucket=config.sticonBucket;
var uploading = multer({
  storage: multer.diskStorage({
      destination: './uploads/files/',
      filename: function (req, file, cb){
        cb( null, shortid.generate());
          // user shortid.generate() alone if no extension is needed
      }
  })
});

function cho_hangul(str) {
  cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  result = "";
  for(i=0;i<str.length;i++) {
    code = str.charCodeAt(i)-44032;
    if(code>-1 && code<11172) result += cho[Math.floor(code/588)];
    else result += str.charAt(i);
  }
  return result;
}
var makesticker = function(app){
  app.post('/makesticker', uploading.array('file',30), async function(req, res, next) {
    var files=[];
    req.files.forEach((elm)=>{
      files.push({uri:elm.location,type:elm.mimetype});
    });
    var _id = req.body._id||'';
    var query = req.body.query||'';
    var show = req.body.show||0;

    var output = {}; 
    var database = req.app.get('database');
    if(database){
      const find_user= await database.UserModel.find({_id});
      if(find_user.errors||find_user.length!=1){
        console.log('find_user error');
        output.status=401;
        res.send(output);
        return;
      }
      const user_id=find_user[0]._doc.user_id;
      const regex = /#[A-Za-z0-9ㄱ-ㅎ가-힣ㅏㅣ]*/g;
      let hashtag_temp = query.match(regex);
      let hashtag=[];
      let tagquery ='';
      if(hashtag_temp!=null){
        console.log(hashtag_temp)
        hashtag_temp= Array.from(new Set(hashtag_temp));
        console.log(hashtag_temp)
        hashtag_temp.map((em,index)=>{
          if(em!='#'){
            hashtag.push(em.split('#')[1]);
            if(index===0){
              tagquery+=em.split('#')[1];
            }else{
              tagquery+=' '+em.split('#')[1];
            }
          }
        });
      }
      const find_tag= await database.TagModel.find({id:{$in:hashtag}});
      if(find_tag.errors){
        console.log('makesticker find tag error');
        output.status=403;
        res.send(output);
        return;
      }
      let newTag=[];
      let oldTag=[];
      hashtag.map(em=>{
        let ft_i=find_tag.findIndex(emS=>emS._doc.id==em);
        if(ft_i===-1){
          let id_query='';
          for(let key in em){
            id_query+=em[key]+' ';
          }
          newTag.push({
            id:em,
            id_query,
            num:1
          });
        }else{
          let id_query='';
          for(let key in em){
            id_query+=em[key]+' ';
          }
          oldTag.push(em);
        }
      });
      const insert_Tag=await database.TagModel.insertMany(newTag);
      if(insert_Tag.errors){
        console.log('insert_Tag error');
        output.status=405;
        res.send(output);
        return;
      }
      await database.TagModel.updateMany({id:{$in:oldTag}},{$inc:{num:1}});
      let tagTemp='';
      for(let index in tagquery){
        tagTemp+=' '+tagquery[index];
      }
      tagquery+=tagTemp;
      ///
      ///
      const _upload=[128,180,360,720];
      const image0 = await resizeImg(fs.readFileSync(req.files[0].path), {
        width: _upload[0],
      });
      const image1 = await resizeImg(fs.readFileSync(req.files[0].path), {
        width: _upload[1],
      });
      const image2 = await resizeImg(fs.readFileSync(req.files[0].path), {
        width: _upload[2],
      });
      const image3 = await resizeImg(fs.readFileSync(req.files[0].path), {
        width: _upload[3],
      });
      var count=0;
      _upload.map((em,index)=>{
        if(index==0){
          var Body=image0;
        }else if(index==1){
          var Body=image1;
        }else if(index==2){
          var Body=image2;
        }else if(index==3){
          var Body=image3
        }
        var params = {
            Bucket      : bucket,
            Key         : `${req.files[0].filename}_${em}`,
            Body        ,
            ContentType : req.files[0].mimeType,
            ACL: 'public-read'
        };
        s3.putObject(params, function(err, data) {
          if (!err) {
            console.log('success')
            count++;
            if(count==_upload.length){
              _finish();
            }
          }else {
            console.log(err);
            output.status=401;
            res.send(output);
          }
        });
      });
      let _finish=()=>{
        console.log('_finish');
        fs.unlink(`uploads/files/${req.files[0].filename}`,()=>{console.log('fsunlink')});
        let clip=[
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${req.files[0].filename}_${_upload[0]}`,
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${req.files[0].filename}_${_upload[1]}`,
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${req.files[0].filename}_${_upload[2]}`,
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${req.files[0].filename}_${_upload[3]}`
        ]
        var Sticker = new database.StickerModel({
          user_id,
          text:query,
          tag:tagquery,
          clip,
          ct:parseInt(Date.now()),
          show
        });
        Sticker.save(async (err)=>{
          if(err){
            console.log('Sticker save error');
            output.status=402;
            res.send(output);
            return;
          }
          console.log('make sticker success')
          output.status=100;
          output.clip=clip;
          output.status=100;
          res.send(output);
        })
      }
    }else{
      console.log('makegroup no database');
      output.status=410;
      res.send(output);
    } 
  });
}

 module.exports = makesticker;