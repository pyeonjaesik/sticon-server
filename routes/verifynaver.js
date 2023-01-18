const fetch = require('node-fetch');

var verifynaver = function(req, res) {
  console.log('verify_naver');
  var output={};
  var accessToken = req.body.accessToken||0;
  var _id = req.body._id; 
	var database = req.app.get('database');
	if (database.db) {
    fetch('https://openapi.naver.com/v1/nid/me', {
      method: 'get',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    })
    .then(res => res.json())
    .then(json => {
      console.log(json);
      var user_id='n'+json.response.id;
      database.UserModel.find({_id},(err,results)=>{
        if(err){
          console.log('verfiy naver UserModel.find err');
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length>0){
          if(results[0]._doc.user_id==user_id){
            console.log('verify naver success');
            output.status=100;
            res.send(output);
          }else{
            console.log('verfit naver failed2');
            output.status=200;
            res.send(output);
          }
        }else{
          console.log('verfiy naver failed');
          output.status=200;
          res.send(output);
        }
      });
    });
	} else {
    output.status =4;
    res.send(output);
	}
	
};
module.exports.verifynaver = verifynaver;