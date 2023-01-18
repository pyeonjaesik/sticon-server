var Schema = {};
Schema.createSchema = function(mongoose){
  var ChatRoomSchema = mongoose.Schema({
    player:[],
    info:[],
    updatetime:{type:Number,'default':0},
    room:[],
  });
  return ChatRoomSchema;    
};
module.exports = Schema;