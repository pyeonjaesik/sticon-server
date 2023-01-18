var config = require('../config');
var FCM = require('fcm-node');
var fcm = new FCM(config.serverKey);

var groupdisagree = async function(req,res){
  var _id = req.body._id||0;
  var group_name= req.body.id||'';
  var database = req.app.get('database');    
  var output ={};
  if(database){
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length==0){
      console.log('groupagree');
      output.status=401;
      res.send(output);
      return;
    }
    const user_id=find_user[0]._doc.user_id;
    const ph=find_user[0]._doc.ph||user_id;

    var find_group=await database.GroupModel.find({id:group_name});
    if(find_group.errors||find_group.length==0){
      console.log('group disagree: find_group error');
      output.status=402;
      res.send(output);
      return;
    }
    let wating=[];
    var w_i=false;
    await find_group[0]._doc.wating.map(em=>{
      if(em.invited==user_id||em.invited==ph){
        w_i=true;
      }else{
        wating.push(em);
      }
    });
    if(!w_i){
      console.log('groupagree you are not invited');
      output.status=403;
      res.send(output);
      return;
    }
    database.GroupModel.update({id:group_name},{wating},(err)=>{
      if(err){
        console.log('group disagree update error');
        output.status=404;
        res.send(output);
        return;
      }
      console.log('groupdisagree success');
      output.status=100;
      res.send(output);
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.groupdisagree = groupdisagree;