var cellread = async function(req,res){
  console.log('cellread')
  var user_id = req.body.user_id||0;
  var post_id=req.body.post_id||0; 
  var index=req.body.index||0;    
  var database = req.app.get('database');    
  var output ={};
  if(database){
    var find_comment= await database.CommentModel.find({_id:post_id});
    if(find_comment.errors||find_comment.length!=1){
      console.log('cellread: find_comment error');
      output.status=401;
      res.send(output);
      return;
    }
    var cloud=find_comment[0]._doc.cloud;
    var readLeng=0;
    for(var i in cloud){
      if(cloud[i].index===index){
        readLeng++;
      }
    }
    var read=find_comment[0]._doc.read||{};
    if(read[user_id]!=undefined){
      console.log('1')
      read[user_id][index]=readLeng;
    }else{
      console.log('2')
      read[user_id]=[];
      read[user_id][index]=readLeng;
    }
    console.log(read);
    database.CommentModel.update({_id:post_id},{read},(err)=>{
      if(err){
        console.log('cellread: CommentModel.udpate err');
        output.status=402;
        res.send(output);
        return;
      }
      console.log('cellread success');
      output.status=100;
      res.send(output);

    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.cellread = cellread;