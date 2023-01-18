var Schema = {};
Schema.createSchema = function(mongoose){
  var TkSchema = mongoose.Schema({
    user_id:{type:String,index:'hashed'},  
    tk:{type:String,'default':'0',index:'hashed'},
    socket:{type: String, 'default':''},
    ptk:{type:String,'default':'',index:'hashed'},  
    d:{type:Number,'default':0},
    n:{type:Number,'default':0},
    c:{type:Number,'default':0},
    p:{type:Number,'default':0}  
  });
  return TkSchema;    
};
module.exports = Schema;