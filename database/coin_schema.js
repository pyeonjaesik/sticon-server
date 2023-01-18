var Schema = {};
Schema.createSchema = function(mongoose){
  var CoinSchema = mongoose.Schema({
    coin:{type:Number,'default':0},  
    p:[], //coin 구매
    s:[], // coin 환전
    g:[],   //아무도 미션을 수행하지않아 코인이 다시 미션 게시자에게 돌아옴.
    t:[],  // 보상으로 coin 을 획득
    e:[],   // 다른사람에게 보상으로써 coin 을 제공
    charr:[]
  });
  return CoinSchema;    
};
module.exports = Schema;