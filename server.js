var { ObjectID } = require('mongodb');
const express = require('express');
const bodyparser = require('body-parser');
const {mongoose} = require('./db/db');
const { User } = require('./model/UserSchema');
const { Todo } = require('./model/TodoSchema');
const {_} = require('lodash');
var {secret} = require('./config/config');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');
var { authenticate } = require ('./middleware/authenticate');


var app = express();

//Create a port variable for heroku
const port = process.env.PORT || 3000;


app.use(bodyparser.json());

app.get('/',function(req, res){
    res.send("Hello World");
});

//Regstering a user using a post method
app.post('/users', function(req, res){

    var reqbody = _.pick(req.body,['email','password']);
    //hash the password
    //var hashPassword = bcrypt.hashSync(reqbody.password, 10);
    //reqbody.password = hashPassword;

    var user = new User(reqbody);

    user.save(user).then((user)=>{

        console.log("User got created successfully");
        return user.generateAuthToken();

    }).then((token)=>{
        res.status(201).header('x-auth', token).send(_.pick(user,["email"]));
    })
    .catch((e) =>{
        res.status(400).send(e);

    })

});

//Create a authenticate middleware



//Getting a user
app.get('/user/me', authenticate, function(req, res){
    res.status(200).send(_.pick(req.user,['_id','email']));
})


//Logging in the user
app.post('/user/login', function(req, res){
    User.findUserByCredentials(req.body).then((user)=>{
        return user.generateAuthToken().then((token)=>{
            res.header('x-auth', token).send(_.pick(user,['_id','email']));
        });
    }).catch((e)=>{
        res.status(404).send("Unable to login. Please check userId/password");
    });
});


app.delete('/user/delete/token',(req, res)=>{
    var user = new User();
    user.removeToken(req.header['x-auth']).then(()=>{
        res.send();
    }).catch((e)=>{
        res.status(400).send(e);
    });
});

app.post('/todos',(req, res)=>{
    var TodoCreate = new Todo(req.body);

    TodoCreate.save().then((todo)=>{
        console.log("Todo was added to the list");
        res.status(201).send(todo);
    }).catch((e)=>{
        res.status(400).send(e);
        //console.log("There was an error while adding a todo task");
    })
});

//searches for all the todos
app.get('/todos',(req, res)=>{
    Todo.find({}).then((todos)=>{
        res.send({todos});
    }).catch((e)=>{
        res.status(404).send(e);
    })
});

//Search a todo by Id
app.get('/todos/:id', (req, res) => {
    var searchid = req.params.id;

    if (!ObjectID.isValid(searchid)){
        return res.status(400).send("Not a valid ID");
    }
    Todo.findById(searchid).then((todo) => {
        if(todo){
           res.send({todo});

       }else{
            res.status(404).send("Todo not found!!");
       }

    }).catch((e) => {
        res.status(400).send(e);
    })

});

//delete a todo by Id
app.delete('/todos/:id', (req, res)=>{
    var idToBeDeleted = req.params.id;


    if(!ObjectID.isValid(idToBeDeleted)) {
        return res.status(400).send("Id is not Valid");
    }

    Todo.findOneAndRemove({"_id": idToBeDeleted}).then((todo)=>{
        if (todo){
            res.send({todo});
        }else{
            res.status(404).send("Todo does not exist")
        }
    }).catch((e)=> {
        res.status(400).send(e);
    })
})

//patch a todo (update a text and assigned To  and done)
app.patch('/todos/:id', (req, res) => {

    var id = req.params.id;
    var body = _.pick(req.body,['task','done']);

    if (_.isBoolean(body.done) && body.done === true){
        body.dueDate= new Date().getTime();
    }else {
        body.done=false;
        body.dueDate = null;

    }

    Todo.findByIdAndUpdate(id, {
        $set:body
    },{
        new: true
    }).then((todo)=>{
        if(todo){
            res.send({todo});
        }else{
            res.status(404).send("Todo not Found");
        }
    }).catch((e)=>{
        res.status(400).send(e);
    })

});

app.listen(port,() => console.log('Example app listening on port'+`${port}`));

module.exports={
    app
}