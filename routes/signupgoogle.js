var atob = require('atob');

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
};

var signupgoogle = async function(req, res) {
  console.log('signup_apple');
  var output={};
  var accessToken= req.body.accessToken;
  var database = req.app.get('database');
  console.log('accesToken');
	if (database.db) {
    var json= await parseJwt(accessToken);
    console.log(json);
    var profile={
      user_id:'g'+json.sub,
      id:json.name!=''?json.name:json.sub,
      uid:json.sub,
      img:json.picture!=undefined?json.picture:'',
      thumbnail:'',
      email:json.email!==undefined&&json.email!==null?json.email:'',
      birthday:0,
      age:0,
      gender:0
    };
    var id_query='';
    var id_length=profile.id.length;
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
            console.log('signup google: CoinModel.find err');
            output.status=420;
            res.send(output);
            return;
          }
          if(results.length>0){
            output.coin=results[0]._doc.coin;
            output.status=200;
            res.send(output);
            console.log('signup google: already sign up so just login');
          }else{
            console.log('signup google: CoinModel.find results.length==0 -->err');
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
            output.id=json.name;
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
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.signupgoogle = signupgoogle;