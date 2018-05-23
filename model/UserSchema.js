require('./../config/config.js');
var mongoose = require('mongoose');
var validator = require('validator');
var jwt = require('jsonwebtoken');
var bcrypt = require ('bcryptjs');

var UserSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        minlength:1,
        unique:true,
        validate:{
            validator: validator.isEmail,
            message: '{VALUE} is not email'
            }
        },
    password:{
        type:String,
        require:true,
        minlength:6
    },
    tokens:[{
        access:{
            type:String,
            require:true,
            trim:true

        },
        token:{
            type:String,
            require:true,
            trim:true

        }
    }]

});




//This is how we create the instance method
UserSchema.methods.generateAuthToken = function(){
    var user = this;
    var access='auth';
    var token = jwt.sign({_id:user._id.toHexString(), access},process.env.JWT_SECRET).toString();

    user.tokens.push({access, token});

    return user.save(user).then((user)=>{
        return token;
    })
};


//This is a instance method to delete the token
UserSchema.methods.removeToken = function(token){
    var user = this;

    return user.update({
        $pull:{
            tokens:{token}
        }
    });
}


//This is how we create Model Method
UserSchema.statics.findByToken = function(token){
    var User = this;
    var access = 'auth';


        return jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){

            if (!err){

                return User.findOne({
                    "_id":decoded._id,
                   "tokens.access":"auth",
                    "tokens.token":token
                });
            }
            else{
                return new Promise((resolve, reject)=>{
                    reject('Cannot decode');
                })
            }
        });

};


UserSchema.statics.findUserByCredentials = function(searchuser){

    var User = this;

    return User.findOne({email:searchuser.email}).then((user)=>{

        if(user === null ){
            return Promise.reject();
        }

        if(bcrypt.compareSync(searchuser.password, user.password)){
            return user;
        }
        else{
            return Promise.reject();
        }
    });
}

UserSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        user.password = bcrypt.hashSync(user.password, 10);
        next();
    }else
    {
        next();
    }
})

var User = mongoose.model('User', UserSchema);

module.exports={
    User
}
