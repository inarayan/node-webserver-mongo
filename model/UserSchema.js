var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    age:{type:Number}
})

var User = mongoose.model('User', UserSchema);


module.exports={
    User
}
