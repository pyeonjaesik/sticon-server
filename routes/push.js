var config = require('../config');

var push = async function(req,res){
  console.log('push')
  var FCM = require('fcm-node');
  var database = req.app.get('database');
  var user_id=req.body.user_id;
  console.log(user_id);
  var output ={};
  var find_tk= await database.TkModel.find({user_id});
  if(find_tk.errors){
    console.log('push err');
    output.status=401;
    res.send(output);
    return;
  }
  var client_token=find_tk[0]._doc.tk
  var push_data = {
    to: client_token,
    notification: {
      title: "건호 바붕",
      body: "님이 게시물을 좋아합니다.",
      sound: "default",
      icon: "fcm_push_icon"
    },
    priority: "high",
    restricted_package_name: "com.yomencity.puppy",
    data: {id:'a',b:'b',c:'c'}
  };
  var fcm = new FCM(config.serverKey);
  output.token=client_token;
  res.send(output);
  await fcm.send(push_data, function(err, response) {
    if (err) {
      console.log(err)
      output.status=700;
      return;
    }
    console.log('success')
    // responsing.send(output);
    return;
  });  
  console.log('aa')
 
    
};
module.exports.push = push;