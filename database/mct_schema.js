var Schema = {};
Schema.createSchema = function(mongoose){
  var MctSchema = mongoose.Schema({
    user_id:{type:String, index:'hashed', required:true},
    // merchant:{type:String, index:'hashed', required:true, unique: true},
    merchant:{type:String, index:'hashed', required:true},
    ct:{type:Number, required:true},
    imp:{type:String, index:'hashed'},
    amount:{type:Number, required:true},
    history:[],  //0 => just tried , other number -> 각각의 오류 혹은 status 별로 오류기재
  });
  return MctSchema;    
};
module.exports = Schema;