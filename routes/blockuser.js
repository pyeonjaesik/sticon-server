var blockuser = function(req,res){
  console.log('blockuser')
  var _id = req.body._id||0;
  var user_id=req.body.user_id||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    database.FollowModel.find({_id},(err,results)=>{
      if(err){
        console.log('FollowModel.find');
        output.status=400;
        res.send(output);
        return;
      }
      if(results.length>0){
        var block=results[0]._doc.block.map(x=>x);
      
        block.unshift(user_id);

        var block_unique=block.reduce((unique, item) =>
        unique.includes(item) ? unique : [...unique, item], []);

        database.FollowModel.update({_id},{block:block_unique},(err)=>{
          if(err){
            console.log('FollowModel.find err');
            output.status=401;
            res.send(output);
            return;
          }
          output.status=100;
          res.send(output);
        });
      }else{
        console.log('FollowModel.find resulst.length==0 -->err');
        output.status=401;
        res.send(output);
      }
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.blockuser = blockuser;