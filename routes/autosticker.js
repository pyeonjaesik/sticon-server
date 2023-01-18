var autosticker = async function(req, res) {
  console.log('autosticker2');

  var output={};
  var database = req.app.get('database');
  const user_id = req.body.user_id||'master';
  const query = req.body.query||'';
  const clip =req.body.clip
  console.log(user_id);
  console.log(query);
  console.log(clip);
	if (database.db) {
    const regex = /#[A-Za-z0-9ㄱ-ㅎ가-힣ㅏㅣ]*/g;
    let hashtag_temp = query.match(regex);
    let hashtag=[];
    let tagquery ='';
    if(hashtag_temp!=null){
      hashtag_temp= Array.from(new Set(hashtag_temp));
      hashtag_temp.map((em,index)=>{
        if(em!='#'){
          hashtag.push(em.split('#')[1]);
          if(index===0){
            tagquery+=em.split('#')[1];
          }else{
            tagquery+=' '+em.split('#')[1];
          }
        }
      });
    }
    const find_tag= await database.TagModel.find({id:{$in:hashtag}});
    if(find_tag.errors){
      console.log('makesticker find tag error');
      return;
    }
    let newTag=[];
    let oldTag=[];
    hashtag.map(em=>{
      let ft_i=find_tag.findIndex(emS=>emS._doc.id==em);
      if(ft_i===-1){
        let id_query='';
        for(let key in em){
          id_query+=em[key]+' ';
        }
        newTag.push({
          id:em,
          id_query,
          num:1
        });
      }else{
        let id_query='';
        for(let key in em){
          id_query+=em[key]+' ';
        }
        oldTag.push(em);
      }
    });
    const insert_Tag=await database.TagModel.insertMany(newTag);
    if(insert_Tag.errors){
      console.log('insert_Tag error');
      return;
    }
    await database.TagModel.updateMany({id:{$in:oldTag}},{$inc:{num:1}});
    let tagTemp='';
    for(let index in tagquery){
      tagTemp+=' '+tagquery[index];
    }
    tagquery+=tagTemp;

    var Sticker = new database.StickerModel({
      user_id,
      text:query,
      tag:tagquery,
      clip,
      ct:parseInt(Date.now()),
      show:0
    });
    Sticker.save(async (err,result)=>{
      if(err){
        console.log('Sticker save error');
        return;
      }
      output.status=100;
      res.send(output);
    })

	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.autosticker = autosticker;