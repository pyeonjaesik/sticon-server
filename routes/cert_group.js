var cert_group = function(req,res){
    var paramId = req.body.id||0;
    console.log('cert_group'+paramId)
    var output = {};
    if(paramId.length<2||paramId.length>20){
      console.log('not valid info11');
      output.status=800;
      res.send(output)    
      return;  
    }    
    var database = req.app.get('database');    
    if(database.db){
      database.GroupModel.find({id:paramId},function(err,results){
        if(err){
          console.log('cert_group:err')
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length>0){
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
module.exports.cert_group = cert_group;