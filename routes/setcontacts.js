var setcontacts = async  function(req, res) {
  console.log('setcontacts');
  var _id=req.body._id||'';
  var contacts=req.body.contacts||[];
  console.log(contacts);
  var output={};
  output.post=[];
  var database = req.app.get('database');
	if (database.db) {
    if(_id==''){
      console.log('_id==""')
      output.status=401;
      res.send(output);
      return;
    }
    var find_contacts=await database.ContactsModel.find({_id});
    if(find_contacts.errors||find_contacts.length===0){
      console.log('ContactsModel.find err');
      output.status=401;
      res.send(output);
      return;
    }
    var contacts_original=[...find_contacts[0]._doc.contacts];
    for (let index in contacts){
      let c_i=contacts_original.findIndex(em=>em.ph==contacts[index].ph);
      if(c_i==-1){
        contacts_original.unshift(contacts[index])
      }else{
        contacts_original.splice(c_i,1,contacts[index])
      }
    }
    contacts_original=contacts_original.filter(em=>em.name!=undefined&&em.ph!=undefined);
    database.ContactsModel.update({_id},{contacts:contacts_original},async (err)=>{
      if(err){
        console.log('setcontacts: ContactsModel.update err');
        output.status=402;
        res.send(output);
        return;
      }
      output.contacts=contacts_original;
      output.status=100;
      res.send(output);
    });
	} else {
    output.status = 410;
    res.send(output);
	}
};
module.exports.setcontacts = setcontacts;