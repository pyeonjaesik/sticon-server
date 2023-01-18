var Schema = {};

Schema.createSchema = function(mongoose){
    var PostSchema = mongoose.Schema({
        key:{type: String, required:true,'default':'',index: 'hashed'},
        user_id:{type: String, required:true,'default':'',index: 'hashed'},
        text:{type: String,trim:false,default:''},
        clip:[],
        roll:{type: String ,default:''},
        thumb:{type: String,default:''},
        ct:{type:Number, 'default': 1519021633963},
        ut:{type:Number, 'default': 1519021633963},
        ln:{type:Number, 'default':0},
        cn:{type:Number, 'default':0},
        personList:[],
        groupList:[],
        profile_save:{type:Boolean, 'default': true},
        show:{type:Number, 'default':100},
        read:[],
        lastRead:{},
        report:[]
    });
    return PostSchema;
};

module.exports = Schema;