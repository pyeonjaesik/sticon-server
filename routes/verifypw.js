var verifypw = function(req, res) {
  console.log('verifypw');
  var crypto = require('crypto');
  var output={};
  var PW = req.body.pw||0;
  var _id = req.body._id;
  var ct= parseInt(Date.now());
	var database = req.app.get('database');
	if (database.db) {
    database.UserModel.find({_id:_id},async function(err,results){
      if(err){
        console.log('verifypw: err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        var salt = results[0]._doc.salt;
        var encryptPW=await crypto.createHmac('sha256', salt).update(PW).digest('hex');
        if(ct-results[0]._doc.pwct>300000){
          if(encryptPW===results[0]._doc.pw){
            database.UserModel.update({_id},{pwct:0,pwindex:0},(err)=>{
              if(err){
                console.log('verifypw: UserModel.update err');
                output.status=501;
                res.send(output);
                return;
              }
              output.status=100;
              res.send(output);
            });
          }else{
            database.UserModel.update({_id},{pwct:ct,pwindex:1},(err)=>{
              if(err){
                console.log('verifypw: UserModel.update err');
                output.status=501;
                res.send(output);
                return;
              }
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
                output.status=100;
                res.send(output);
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
                  output.status=200;
                  res.send(output);
                }
              });
            }
          }
        }
      }else{
        console.log('verifypw: results.length==0 --> err');
        output.status=402;
        res.send(output);
      }
    }); 
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.verifypw = verifypw;