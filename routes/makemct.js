var makemct = function(req,res){
  console.log('makemct');
  var _id=req.body._id;
  var amount=req.body.amount;
  var method=req.body.method||'card';
  var output={};
  var database = req.app.get('database');    
  if(method=='card'){
    
  }else{
    output.status=700;
    output.alert='현재 핸드폰 소액결제는 불가능합니다. 곧 더 나은 서비스로 찾아뵙겠습니다.';
    res.send(output);
    return;
  }
  if(database.db){
    database.UserModel.find({_id},(err,results)=>{
      if(err){
        console.log('mackemct UserModel.find err');
        output.status=301;
        res.send(output);
        return;
      }
      if(results.length>0){
        var user_id=results[0]._doc.user_id;
        var ct=parseInt(Date.now());
        var token_random=parseInt(Math.random()*10000000);
        var mct=user_id+'-'+ct+token_random;
        database.MctModel.find({merchant:mct},(err,results)=>{
          if(err){
            console.log('makemct: merchantuid');
            output.status=401;
            res.send(output);
            return;
          }
          if(results.length>0){
            console.log('not unique merchant uid --> hacker attack');
            output.status=501;
            res.send(output);
          }else{
            var Mct_model = new database.MctModel({user_id:user_id,merchant:mct,ct:ct,amount:amount});
            Mct_model.save(function(err){
              if(err){
                console.log('Mct_model.save err');
                console.dir(err);
                output.status=401;
                res.send(output);
                return;    
              }
              output.status=100;
              output.mct=mct;
              console.log(`mct:${mct}`);
              res.send(output);   
            });  
          }
        }); 
      }else{
        console.log('mackemct UserModel.find results.length ==0 --> err');
        output.status=302;
        res.send(output);
      }
    });   
  }else{
    output.status = 410;
    res.send(output);
  }
};
module.exports.makemct = makemct;