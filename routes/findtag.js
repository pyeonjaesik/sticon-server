var findtag = async function(req,res){
  console.log('findtag')
    var query = req.body.query||0;
    var tag_query='';
    var tag_length=query.length;
    for(var i=0;i<tag_length;i++){
      if(i==0){
        tag_query+=query[i];
      }else{
        tag_query+=' '+query[i];
      }
    }
    console.log(`query: ${query}`);
    var output = {};
    var database = req.app.get('database');    
    if(database.db){
      if(query==0){
        output.status=102;
        res.send(output);
        return;
      }
      var find_sticon =  await database.TagModel.find({$text:{$search:tag_query}},{ score: { $meta: "textScore" } }).sort( { score: { $meta: "textScore" } ,num:1}).limit(100);
      if(find_sticon.errors){
        output.status=401;
        res.send(output);
        return;
      }
      output.status=100;
      output.post=await find_sticon.map(em=>{
        return{
          id:em._doc.id,
          num:em._doc.num,
        }
      })
      console.log(output.post);
      output.status=100;
      res.send(output);
    }else{
      console.log('112223');
      output.status = 410;
      res.send(output);
    }
};
module.exports.findtag = findtag;