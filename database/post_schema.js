var Schema = {};

Schema.createSchema = function(mongoose){
    var PostSchema = mongoose.Schema({
        user_id:{type: String, required:true,'default':'',index: 'hashed'},//소비자
        book_user_id:{type: String, required:true,'default':'',index: 'hashed'}, //생산자
        myname:{type: String, required:true,'default':''},
        friendname:{type: String,'default':''},
        text:{type: String,trim:false,default:''},
        clip:[],
        created_time:{type:Number, 'default': 1519021633963},
        ct:{type:Number, 'default':0}, //미션수행(영상 업로드)된 시간
        coin:{type:Number, 'default': 0},
        idx:{type:Number, 'default':0},
        // ci:{type:String, 'default':''},
        // cp:{type:String, 'default':''},
        // cn:{type:Number, 'default':0},
        // b:{type:Number, 'default':0}
    });
    
    return PostSchema;
};

module.exports = Schema;