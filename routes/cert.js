var cert = function(req,res){
    var paramId = req.body.id||0;
    console.log(paramId);
    console.log(`nickname: ${paramId}`);
    var output = {};
    var txt_check = /^[a-z|A-Z|0-9|\*]+$/;
    console.log('asd');
    if(!txt_check.test(paramId)){
      console.log('not valid info');
      output.status=800;
      res.send(output);
      return;
    }
    console.log("fad");
    if(paramId.length<2||paramId.length>12){
      console.log('not valid info11');
      output.status=800;
      res.send(output)    
      return;  
    }    
    var regex = new RegExp(["^", paramId, "$"].join(""), "i");
    var database = req.app.get('database');    
    if(database.db){
      console.log('11')
      database.UserModel.find({uid:regex},function(err,results){
        if(err){
          console.log('cert:err')
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length >0){
          console.log(`2`);
          output.status = 2;
          res.send(output);
        }else{
          console.log(`1`);
          output.status = 1;
          res.send(output);
        }
      });
    }else{
      console.log('112223');
      output.status = 410;
      res.send(output);
    }
};
module.exports.cert = cert;