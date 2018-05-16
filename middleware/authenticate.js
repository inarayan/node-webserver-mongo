var { User } = require('./../model/UserSchema');

var authenticate = (req, res, next)=>{
    var token = req.headers['x-auth'];

        if (!token){
        //Response status captures unauthorized error
        res.status(401).send({auth:false, message:'No token provided'});
    }

    User.findByToken(token).then((user)=>{
        req.user = user;
        req.token = token;

        next();

    }).catch((e)=>{
        res.status(401).send({'auth':'false', 'message':'un-authorized access','Error':e});
    })

}

module.exports ={
    authenticate
}