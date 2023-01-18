var Schema = {};
Schema.createSchema = function(mongoose){
  var LvSchema = mongoose.Schema({
    video:[],
  });
  return LvSchema;    
};
module.exports = Schema;