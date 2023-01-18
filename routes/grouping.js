var grouping = function(req,res){
  var _id = req.body._id||0;
  var group_id=req.body.group_id||0;  
  var id_query='';
  var id_length=group_id.length;
  for(var i=0;i<id_length;i++){
    if(i==id_length-1){
      id_query+=group_id[i];
    }else{
      id_query+=group_id[i]+' '

    }
  }  
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
        if(results[0]._doc.group.indexOf(group_id)!==-1){
          console.log('aleady Group');
          output.status=102;
          res.send(output);
          return;
        }
        database.FollowModel.update({_id},{$push: { group: group_id.toString() }},(err)=>{
          if(err){
            console.log('FollowModel.find err');
            output.status=401;
            res.send(output);
            return;
          }
          database.GroupModel.find({id:group_id},(err,results)=>{
            if(err){
              console.log('GroupModel.find err');
              output.status=405;
              res.send(output);
              return;
            }
            if(results.length>0){
              var group_object_id=results[0]._doc._id;
              database.GroupModel.update({_id:group_object_id},{$inc:{member:1}},(err)=>{
                if(err){
                  console.log('FollowModel.update err');
                  output.status=404;
                  res.send(output);
                  return;
                }
                console.log('grouping success');
                output.status=100;
                res.send(output);
                return
              });
            }else{
              var Group = new database.GroupModel({id:group_id,member:1,id_query});
              Group.save((err)=>{
                if(err){
                  console.log('grouping: Group.save err');
                  output.status=407;
                  res.send(output);
                  return;
                }
                console.log('grouping success')
                output.status = 100;
                res.send(output);
              });
            }
          })
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
module.exports.grouping = grouping;