const{ObjectID} = require('mongodb');
const {mongoose} = require('./../db/db');
const {User} = require('./../model/UserSchema');

var id = new ObjectID("6ae1365018365f23cf702a4c");

User.findById(id).then((doc)=> {
    if(!doc){
       console.log("User does not exist");
    }else{
        console.log("User Found" + doc);
    }


}).catch((e)=>{
    console.log(e);
});
