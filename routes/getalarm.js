var getalarm = async function(req, res) {
  console.log('getalarm')
  var _id=req.body._id||'';
  var output={};
  var database = req.app.get('database');
	if (database.db) {
    var find_user= await database.UserModel.find({_id});
    if(find_user.errors||find_user.length==0){
      console.log('getalarm find_user error');
      output.status=400;
      res.send(output);
      return;
    }
    const user_id=find_user[0]._doc.user_id;
    const ph=find_user[0]._doc.ph||user_id;
    var find_wating = await database.GroupModel.find({
      $and:[
        {
          members:{
            $not:{
              $elemMatch:{
                user_id
              }
            }
          }
        },
        {
          wating:{
            $elemMatch:{
              invited:{
                $in:[user_id,ph]
              }
            }
          }
        },
        {
          wating:{
            $not:{
              $elemMatch:{
                inviter:user_id
              }
            }
          }
        }
      ]
    }).sort({_id:-1});
    if(find_wating.errors){
      console.log('find_wating errors');
      output.status=411;
      res.send(output);
      return;
    }
    var wating_arr=[];
    var inviter_arr=[];
    find_wating.map(emP=>{
      let w_i=emP._doc.wating.findIndex(emS=>emS.invited==user_id);
      if(w_i!=-1){
        wating_arr.push({
          id:emP._doc.id,
          img:emP._doc.img,
          member:emP._doc.member,
          ...emP._doc.wating[w_i]
        });
        if(inviter_arr.indexOf(emP._doc.wating[w_i].inviter)==-1){
          inviter_arr.push(emP._doc.wating[w_i].inviter)
        }
      }else if(ph!=user_id){
        let p_i=emP._doc.wating.findIndex(emS=>emS.invited==ph);
        if(p_i!=-1){
          wating_arr.push({
            id:emP._doc.id,
            img:emP._doc.img,
            member:emP._doc.member,
            ...emP._doc.wating[p_i]
          });
          if(inviter_arr.indexOf(emP._doc.wating[p_i].inviter)==-1){
            inviter_arr.push(emP._doc.wating[p_i].inviter)
          }
        }
      }
    });
    output.wating=wating_arr;
    let user_id_arr=[...inviter_arr];
    user_id_arr=await user_id_arr.filter((item, index) => user_id_arr.indexOf(item) === index);

    const find_follow = await database.FollowModel.find({
      request:{
        $elemMatch:{
          user_id
        }
      }
    });
    if(find_follow.errors){
      console.log('getalarm find_follow error');
      output.status=401;
      res.send(output);
      return;
    }
    let request_id=find_follow.map(em=>{
      return {
        _id:em._doc._id.toString(),
        ct:em._doc.request.find(emS=>emS.user_id==user_id).ct
      }
    });

    const find_alarm = await database.AlarmModel.find({_id});
    if(find_alarm.errors||find_alarm.length!=1){
      console.log('get alarm error');
      output.status=401;
      res.send(output);
      return;
    }
    let alarm_user_id=[];
    output.alarm=find_alarm[0]._doc.alarm.map(em=>{
      alarm_user_id.push(em.user_id);
      return em;
    });
    user_id_arr=[
      ...user_id_arr,
      ...alarm_user_id
    ]
    user_id_arr=await user_id_arr.filter((item, index) => user_id_arr.indexOf(item) === index);

    var find_user_arr= await database.UserModel.find({
      $or:[
        {
          user_id:{$in:user_id_arr}
        },
        {
          _id:{$in:request_id.map(em=>em._id)}
        },
      ]
    });
    if(find_user_arr.errors){
      console.log('getalarm: user_arr find error');
      output.status=405;
      res.send(output);
      return;
    }
    output.requester=[];
    output.user_arr= await find_user_arr.map(em=>{
      let requset_temp=request_id.find(emS=>emS._id==em._doc._id.toString());
      if(requset_temp!=undefined){
        output.requester.push({
          user_id:em._doc.user_id,
          id:em._doc.id,
          img:em._doc.img,
          ct:requset_temp.ct
        })
      }
      return{
        user_id:em._doc.user_id,
        id:em._doc.id,
        img:em._doc.img
      }
    });
    console.log(output);
    output.status=100;
    res.send(output);
	} else {
    output.status = 410;
    res.send(output);
	}
	
};
module.exports.getalarm = getalarm;