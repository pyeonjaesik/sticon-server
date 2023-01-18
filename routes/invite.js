const Mustache  = require('mustache');
var fs = require('fs');
function inviteHTML() {
  return fs.readFileSync('./dist/invite.html').toString();
}
var invite = async function(req,res){
  console.log('hi');
  console.log(req.query);
  var group_id=req.query.group_id;
  console.log(group_id);
  var database = req.app.get('database');
  var find_group= await database.GroupModel.find({_id:group_id});
  if(find_group.errors||find_group.length!=1){
    console.log('invite group error');
    var view = {
      status:404
    }; 
  }else{
    var user_arr=[];
    var name_arr=[];
    var members=[...find_group[0]._doc.members]
    for(let index in members){
      user_arr.push(members[index].user_id);
    }
    console.log(user_arr);
    var wating=[...find_group[0]._doc.wating]
    for(let index in wating){
      if(find_group[0]._doc.wating[index].status==0){
        user_arr.push(wating[index].invited);
      }else{
        name_arr.push(wating[index].name);
      }
    }
    console.log(name_arr)
    var find_users= await database.UserModel.find({user_id:{$in:user_arr}});
    if(find_users.errors){
      console.log('invite group find users error');
    }
    var new_name_arr=[];
    for(let index in find_users){
      new_name_arr.push(find_users[index]._doc.id);
    }
    name_arr=new_name_arr.concat(name_arr);
    var list=''
    for(let index in name_arr){
      console.log(index);
      if(index==0){
        list+=name_arr[index];
      }else{
        list+=', '+name_arr[index];
      }
    }
    console.log(list)
    var view = {
      status:100,
      img:find_group[0]._doc.img,
      id:find_group[0]._doc.id,
      list
    }; 
  }
  var html = Mustache.to_html(inviteHTML(),view);
  res.send(html);
};
module.exports.invite = invite;