const fetch = require('node-fetch');

var signupnaver = function(req, res) {
  console.log('signup naver');
  var request = require('request');
  var output={};
  var accessToken= req.body.accessToken;
  console.log(accessToken);
	var database = req.app.get('database');
	if (database.db) {
    fetch('https://openapi.naver.com/v1/nid/me', {
        method: 'get',
        headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    .then(res => res.json())
    .then(json => {
      console.log(json)
      if(json.response.age!==undefined&&json.response.age!==null){
        var age_range=json.response.age;
        var age=parseInt((parseInt(age_range.split('-')[0])+parseInt(age_range.split('-')[1]))/2);
      }else{
        var age=0;
      }
      if(json.response.gender!==undefined&&json.response.gender!==null){
        if(json.response.gender=='M'){
          var gender=1;
        }else{
          var gender=2;
        }
      }else{
        var gender=0;
      }
      if(json.response.birthday!==undefined&&json.response.birthday!==null){
        var birthday=parseInt(json.response.birthday.split('-')[0]+json.response.birthday.split('-')[1]);
      }else{
        var birthday=0;
      }
      var profile={
        user_id:'n'+json.response.id,
        uid:'n'+json.response.id,
        id:json.response.name||'n'+json.response.id,
        img:json.response.profile_image,
        thumbnail:'',
        email:json.response.email!==undefined&&json.response.email!==null?json.response.email:'',
        birthday,
        age,
        gender
      };
      var id_query='';
      var id_length=profile.id.length;
      console.log(profile.id);
      for(var i=0;i<id_length;i++){
        if(i==id_length-1){
          id_query+=profile.id[i];
        }else{
          id_query+=profile.id[i]+' '

        }
      }
      var user_id=profile.user_id;
      output.user_id=user_id;
      database.UserModel.find({user_id},function(err,results){
        if(err){
          console.log('signupkit: UserModel find err');
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length>0){
          output._id=results[0]._doc._id;
          output.id=results[0]._doc.id;
          output.uid=results[0]._doc.uid;
          output.itr=results[0]._doc.itr;
          // var email='';
          // var ph='';
          // if(type==1){
          //   ph=body_obj.phone.number;
          //   // output.ph=ph;
          //   // output.email='';
          // }else{
          //   email=body_obj.email.address;
          //   // output.ph=''
          //   // output.email=email;
          // }
          if(results[0]._doc.pw==='0'){
            output.pwindex='false';
          }else{
            output.pwindex='true';
          }
          database.CoinModel.find({'_id':output._id},function(err,results){
            if(err){
              console.log('signupkit: CoinModel.find err');
              output.status=420;
              res.send(output);
              return;
            }
            if(results.length>0){
              output.coin=results[0]._doc.coin;
              output.status=200;
              res.send(output);
              console.log('signupkit: already sign up so just login');
            }else{
              console.log('signupkit: CoinModel.find results.length==0 -->err');
              output.status=421;
              res.send(output);
            }
          });
        }else{
          var paramId = user_id;
          var ct=parseInt(Date.now());
          var User = new database.UserModel({
            user_id:profile.user_id,
            uid:profile.uid,
            id:profile.id,
            email:profile.email,
            age:profile.age,
            gender:profile.gender,
            birthday:profile.birthday,
            gender:profile.gender,
            img:profile.img,
            thumbnail:profile.thumbnail,
            id_query,
            ct
          });
          User.save(function(err,results){
            if(err){
              console.log('signup kakao: User.save err');
              console.log(err);
              output.status=402;
              res.send(output);
              return;
            }
            if(results){
              var rdi = results._doc._id;
              output._id=rdi;
              output.id=paramId;
              output.uid=user_id;
              console.log('rdi:'+rdi);
              var tk = new database.TkModel({'_id':rdi,'user_id':paramId});
              tk.save(function(err){
                if(err){
                  console.log('tk.save err');
                  output.status=404;
                  res.send(output);
                  return;  
                }
                var Lv = new database.LvModel({'_id':rdi});
                Lv.save(function(err){
                  if(err){
                    console.log('Lv.save err');
                    output.status=405;
                    res.send(output);
                    return;    
                  }
                  var coin = new database.CoinModel({'_id':rdi,coin:0,charr:[rdi.toString()]});
                  coin.save(function(err){
                    if(err){
                      console.log('coin Model.save err');
                      output.status=406;
                      res.send(output);
                      return;  
                    }
                    var alarm = new database.AlarmModel({'_id':rdi});
                    alarm.save((err)=>{
                      if(err){
                        console.log('signupfb: alarm.save err');
                        output.status=407;
                        res.send(output);
                        return;
                      }
                      var QnA = new database.QnAModel({'_id':rdi});
                      QnA.save((err)=>{
                        if(err){
                          console.log('signupfb: QnA.save err');
                          output.status=407;
                          res.send(output);
                          return;
                        }
                        var Follow = new database.FollowModel({'_id':rdi});
                        Follow.save((err)=>{
                          if(err){
                            console.log('signupfb: Follow.save err');
                            output.status=407;
                            res.send(output);
                            return;
                          }
                          output.status = 100;
                          res.send(output);
                        });
                      });
                    });                                 
                  });                            
                });                                                              
              });
            }else{
              console.log('signupdb User.save results == null -->err');
              output.status=402;
              res.send(output);
            }
          });
        }
     });
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.signupnaver = signupnaver;