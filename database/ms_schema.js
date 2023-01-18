var Schema = {};

Schema.createSchema = function(mongoose){
    var MsSchema = mongoose.Schema({
        user_id:{type: String, required:true,'default':'',index: 'hashed'},
        book_user_id:{type: String, required:true,'default':'',index: 'hashed'},
        post_id:{type: String, required:true,'default':'',index: 'hashed'},
        text:{type: String,trim:false,default:''},
        clip:[],
        created_time:{type:Number, 'default': 1519021633963},
        ln:{type:Number, 'default':0},
    });
    
    return MsSchema;
};

module.exports = Schema;