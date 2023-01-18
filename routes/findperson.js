var findperson = async function(req,res){
  console.log('findperson')
    var query = req.body.query||0;
    var id_query='';
    var id_length=query.length;
    for(var i=0;i<id_length;i++){
      if(i==id_length-1){
        id_query+=query[i];
      }else{
        id_query+=query[i]+' '
  
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
      var data= await database.UserModel.find({$text:{$search:id_query}},{ score: { $meta: "textScore" } }).sort({score:{$meta:"textScore"}}).limit(50);
      if(data.errors){
        output.status=401;
        res.send(output);
        return;
      }
      output.status=100;
      output.post=await data.map(em=>{
        return{
          id:em._doc.id,
          img:em._doc.img,
          user_id:em._doc.user_id,
          ph:em._doc.ph,
          uid:em._doc.uid
        }
      })
      var o_i=output.post.findIndex(em=>em.id==query);
      if(o_i===-1){
        console.log('o_i==-1')
        var data2= await database.UserModel.find({id:query});
        if(data2.errors){
          output.status=402;
          res.send(output);
          return;
        }
        if(data2.length>0){
          output.post.unshift({
            id:data2[0]._doc.id,
            member:data2[0]._doc.member
          })
        }
      }
      output.status=100;
      res.send(output);
    }else{
      console.log('112223');
      output.status = 410;
      res.send(output);
    }
};
module.exports.findperson = findperson;