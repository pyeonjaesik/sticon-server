var Schema = {};

Schema.createSchema = function(mongoose){
    var PostSchema = mongoose.Schema({
        cloud:[],
        read:{}
    });
    return PostSchema;
};

module.exports = Schema;