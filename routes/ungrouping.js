var ungrouping = function(req,res){
  var _id = req.body._id||0;
  var group_id=req.body.group_id||0;    
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
        var group_temp=results[0]._doc.group;
        var g_i=group_temp.indexOf(group_id);
        if(g_i==-1){
          console.log('aleady unGroup');
          output.status=102;
          res.send(output);
          return;
        }
        group_temp.splice(g_i,1);
        database.FollowModel.update({_id},{group:group_temp},(err)=>{
          if(err){
            console.log('GroupModel.find err');
            output.status=401;
            res.send(output);
            return;
          }
          database.GroupModel.update({id:group_id},{$inc:{member:-1}},(err)=>{
            if(err){
              console.log('FollowModel.update err');
              output.status=404;
              res.send(output);
              return;
            }
            console.log('ungrouping success');
            output.status=100;
            res.send(output);
            return
          });
        });
      }else{
        console.log('GroupModel.find resulst.length==0 -->err');
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
module.exports.ungrouping = ungrouping;