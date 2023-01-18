var fs = require('fs');
var path = require('path');
var shortid    = require('shortid');
var aws = require('aws-sdk');
var s3 = new aws.S3({});
var Inko = require('inko');
const fetch = require('node-fetch');
const takeURL = require('../config').takeURL;

const resizeImg = require('resize-img');

var autosticker = async function(app){
  await fs.readdir('auto/files/',"utf8",function(err,list){
    if(err){
      console.log('read err');
      return;
    }
    let files=[];
    for(var i=0; i<list.length; i++){
      if(path.extname(list[i])==='.png'||path.extname(list[i])==='.jpeg'||path.extname(list[i])==='.jpg'||path.extname(list[i])==='.PNG')
      { 
          files.push(list[i]); //store the file name into the array files
      }
    }
    let files_new=files.map(em=>{
      if(path.extname(em)==='.png'){
        return {
          query:em.split('.png')[0].normalize(),
          path:`auto/files/${em}`
        }
      }else if(path.extname(em)==='.jpeg'){
        return {
          query:em.split('.jpeg')[0].normalize(),
          path:`auto/files/${em}`
        }
      }else if(path.extname(em)==='.jpg'){
        return {
          query:em.split('.jpg')[0].normalize(),
          path:`auto/files/${em}`
        }
      }else if(path.extname(em)==='.PNG'){
        return {
          query:em.split('.PNG')[0].normalize(),
          path:`auto/files/${em}`
        }
      }
    });

////
////
    var index=0;
    var makesticker = async function(){
      let file=files_new[index];
      var query = file.query;
      const _upload=[128,180,360,720];
      const image0 = await resizeImg(fs.readFileSync(file.path), {
        width: _upload[0],
      });
      const image1 = await resizeImg(fs.readFileSync(file.path), {
        width: _upload[1],
      });
      const image2 = await resizeImg(fs.readFileSync(file.path), {
        width: _upload[2],
      });
      const image3 = await resizeImg(fs.readFileSync(file.path), {
        width: _upload[3],
      });
      var count=0;
      let filename=shortid.generate();
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
            Key         : `${filename}_${em}`,
            Body        ,
            ContentType : 'image/jpeg',
            ACL: 'public-read'
        };
        s3.putObject(params, function(err, data) {
          if (!err) {
            count++;
            if(count==_upload.length){
              _finish();
            }
          }else {
            console.log(err);
          }
        });
      });
      let _finish=()=>{
        console.log('_finish');
        let clip=[
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${filename}_${_upload[0]}`,
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${filename}_${_upload[1]}`,
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${filename}_${_upload[2]}`,
          `https://${bucket}.s3.ap-northeast-2.amazonaws.com/${filename}_${_upload[3]}`
        ]

        var data={
          user_id:'test',
          clip,
          query
        }
        const obj = {
        body: JSON.stringify(data),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        method: 'POST'
        }
        fetch(`${takeURL}/autosticker`, obj)
        .then((response) => response.json())
        .then(async (responseJson) => {
            // status=responseJson.status;
            if(responseJson.status===100){
              fs.unlink(file.path,()=>{console.log('fsunlink')});
              index++;
              if(index===files_new.length){
                console.log('@@@@@@@@@make sticker end: '+index+'번 완료');
              }else{
                console.log('make sticker success : ' +index+'번 완료');
                makesticker();
              }
            }else{
              console.log('make sticker error');
            }
        })
        .catch((error) => {
            console.error(error);
        });
      } 
    }
///
////
    if(files_new.length>0){
      makesticker();
    }else{
      console.log('no files');
    }

  });
}
var bucket='puppytest';


 module.exports = autosticker;