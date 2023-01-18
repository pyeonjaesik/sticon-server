var request = require('request');

var signupfacebook = async function(req, res) {
  console.log('signup_apple');
  var output={};
  var clientId = '2220881804668342';
  var clientSecret = '8f190731fa5003c887f31c445a8ac88c'
  var appLink = 'https://graph.facebook.com/oauth/access_token?client_id=' + clientId + '&client_secret=' + clientSecret + '&grant_type=client_credentials';
  var userToken= req.body.accessToken;
  var database = req.app.get('database');
  console.log('accesToken');
	if (database.db) {
    request(appLink, function (error, response, body) {
      if(error){
        console.log('signupfb: request1 err detected');
        output.status=1001;
        res.send(output);
        return;
      }
      var body_obj= JSON.parse(body);
      var appToken = body_obj.access_token;
      console.log('appToken:'+appToken);
      var link = 'https://graph.facebook.com/debug_token?input_token=' + userToken + '&access_token=' + appToken;
      request(link,function(error, response, body){
        if(error){
          console.log('signupfb: request2 err detected');
          output.status=1002;
          res.send(output);
          return;
        }
        var body_obj= JSON.parse(body);
        console.dir(body_obj);
        var profile={
          user_id:'f'+body_obj.data.user_id,
          id:'f'+body_obj.data.user_id,
          uid:'f'+body_obj.data.user_id,
          img:'',
          thumbnail:'',
          email:'',
          birthday:0,
          age:0,
          gender:0
        };
        var id_query='';
        console.log(profile);
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
            console.log('signup apple: UserModel find err');
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
                console.log('signup facebook: already sign up so just login');
              }else{
                console.log('signup facebook: CoinModel.find results.length==0 -->err');
                output.status=421;
                res.send(output);
              }
            });
          }else{
            var paramId = user_id;
            var ct=parseInt(Date.now());
            var User = new database.UserModel({
              user_id:profile.user_id,
              id:profile.id,
              uid:profile.uid,
              id_query,
              email:profile.email,
              age:profile.age,
              gender:profile.gender,
              birthday:profile.birthday,
              gender:profile.gender,
              img:profile.img,
              thumbnail:profile.thumbnail,
              ct
            });
            User.save(function(err,results){
              if(err){
                console.log('signup apple: User.save err');
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
                          Follow.save(async (err)=>{
                            if(err){
                              console.log('signupapple: Follow.save err');
                              output.status=407;
                              res.send(output);
                              return;
                            }
                            var Contacts = new database.ContactsModel({'_id':rdi});
                            Contacts.save((err)=>{
                              if(err){
                                console.log('contacts save err');
                                output.status=408;
                                res.send(output);
                                return;
                              }
                              console.log('signup facebook success')
                              output.status = 100;
                              res.send(output);
                            });
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
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.signupfacebook = signupfacebook;