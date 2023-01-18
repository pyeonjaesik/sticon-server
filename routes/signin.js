var signin = function(req, res) {
  console.log('signin');
  var crypto = require('crypto');
  var output={};
  var PW = req.body.pw||0;
  var uid = req.body.uid;
  var database = req.app.get('database');
  var ct= parseInt(Date.now());
  var regex = new RegExp(["^", uid, "$"].join(""), "i");
	if (database.db) {
    database.UserModel.find({uid:regex},async function(err,results){
      if(err){
        console.log('verifypw: err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var salt = results[0]._doc.salt||'0';
        var encryptPW=await crypto.createHmac('sha256', salt).update(PW).digest('hex');
        var _id=results[0]._doc._id;
        if(encryptPW===results[0]._doc.pw){
          output._id=results[0]._doc._id;
          output.user_id=results[0]._doc.user_id
          output.id=results[0]._doc.id;
          output.uid=results[0]._doc.uid;
          var err=0;
          for(var i=0;i<output.user_id.length;i++){
            if(output.user_id[i]=='*'){
              err+=1;
            }
          }
          if(err>0){
            output.status=900;
            res.send(output);
            return;
          }
          if(results[0]._doc.pw==='0'){
            output.pwindex='false';
          }else{
            output.pwindex='true';
          }
        }
        if(ct-results[0]._doc.pwct>300000){
          if(encryptPW===results[0]._doc.pw){
            database.UserModel.update({_id},{pwct:0,pwindex:0},(err)=>{
              if(err){
                console.log('verifypw: UserModel.update err');
                output.status=501;
                res.send(output);
                return;
              }
              database.CoinModel.find({_id},function(err,results){
                if(err){
                  console.log('signupfb: CoinModel.find err');
                  output.status=403;
                  res.send(output);
                  return;
                }
                if(results.length>0){
                  output.coin=results[0]._doc.coin;
                  output.status=100;
                  res.send(output);
                  console.log('signin success')
                }else{
                  console.log('autologin: CoinModel.find results.length==0 -->err');
                  output.status=404;
                  res.send(output);
                }
              });
            });
          }else{
            database.UserModel.update({_id},{pwct:ct,pwindex:1},(err)=>{
              if(err){
                console.log('verifypw: UserModel.update err');
                output.status=501;
                res.send(output);
                return;
              }
              console.log('2222');
              output.status=200;
              res.send(output);
            });
          }
        }else{
          var pwindex=results[0]._doc.pwindex;
          if(pwindex>=10){
            output.status=600;
            res.send(output);
          }else{
            if(encryptPW===results[0]._doc.pw){
              database.UserModel.update({_id},{pwct:0,pwindex:0},(err)=>{
                if(err){
                  console.log('verifypw: UserModel.update err');
                  output.status=501;
                  res.send(output);
                  return;
                }
                database.CoinModel.find({_id},function(err,results){
                  if(err){
                    console.log('signupfb: CoinModel.find err');
                    output.status=403;
                    res.send(output);
                    return;
                  }
                  if(results.length>0){
                    output.coin=results[0]._doc.coin;
                    output.status=100;
                    res.send(output);
                    console.log('signin success')
                  }else{
                    console.log('autologin: CoinModel.find results.length==0 -->err');
                    output.status=404;
                    res.send(output);
                  }
                });
              });
            }else{
              database.UserModel.update({_id},{pwct:ct,$inc: { pwindex: 1 } },(err)=>{
                if(err){
                  console.log('verifypw: UserModel.update err');
                  output.status=501;
                  res.send(output);
                  return;
                }
                if(pwindex>=9){
                  output.status=600;
                  res.send(output);
                }else{
                  console.log('111');
                  output.status=200;
                  res.send(output);
                }
              });
            }
          }
        }
      }else{
        console.log('signin failed none id');
        output.status=101;
        res.send(output);
      }
    }); 
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.signin = signin;