var findsticker = async function(req,res){
  console.log('findsticker')
  var query = req.body.query||0;
  var _id = req.body._id||0;
  const user_id = req.body.user_id||0;

  let queryString='';
  for(let index in query){
    if(index===0){
      queryString+=query[index];
    }else{
      queryString+=' '+query[index];
    }
  }
  var output = {};
  var database = req.app.get('database');    
  if(database.db){
    if(query==0){
      output.status=102;
      res.send(output);
      return;
    }
    const find_group = await database.FollowModel.find({_id});
    if(find_group.errors||find_group.length!=1){
      console.log('findsticker: find_group error');
      output.status=404;
      res.send(output);
      return;
    }
    let group=[...find_group[0]._doc.group];
    const find_member = await database.GroupModel.find({id:{$in:group}});
    let user_id_arr= [];
    find_member.map(em=>{
      em._doc.members.map(emS=>{
        if(user_id_arr.indexOf(emS.user_id)==-1){
          user_id_arr.push(emS.user_id);
        }
      })
    });
    if(user_id_arr.indexOf(user_id)==-1){
      user_id_arr.unshift(user_id);
    }
    const find_sticon = await database.StickerModel.find(
        {
          $text:{$search:queryString},
          type:0,
          show:0
        },
        { score: { $meta: "textScore" } }
      )
      .sort( {score: { $meta: "textScore" } })
      .limit(300);

    output.status=100;
    let sticons=await find_sticon.map(em=>{
      return{
        text:em._doc.text,
        clip:[...em._doc.clip],
        user_id:em._doc.user_id,
        ct:em._doc.ct
      }
    });
    const find_sticon_m = await database.StickerModel.find(
      {
        $text:{$search:queryString},
        type:0,
        show:1,
        user_id:{$in:user_id_arr}
      },
      { score: { $meta: "textScore" } }
    )
    .sort( {score: { $meta: "textScore" } })
    .limit(300);
    let sticons_m = await find_sticon_m.map(em=>{
      return{
        text:em._doc.text,
        clip:[...em._doc.clip],
        user_id:em._doc.user_id,
        ct:em._doc.ct
      }
    });
    output.post= [...sticons_m,...sticons];
    output.status=100;
    res.send(output);
    console.log(output.post)
  }else{
    output.status = 410;
    res.send(output);
  }
};
module.exports.findsticker = findsticker;