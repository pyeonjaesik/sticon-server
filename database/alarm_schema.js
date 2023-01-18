var Schema = {};
Schema.createSchema = function(mongoose){
  var AlarmSchema = mongoose.Schema({
    alarm:[],
    leng:{type:Number,'default':0}
  });
  return AlarmSchema;    
};
module.exports = Schema;