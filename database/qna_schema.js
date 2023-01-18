var Schema = {};
Schema.createSchema = function(mongoose){
  var QnASchema = mongoose.Schema({
    qna:[],
    ut:{type:Number,'default':9999999999999}  
  });
  return QnASchema;    
};
module.exports = Schema;