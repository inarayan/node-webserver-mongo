var express = require('express');
var bodyparser = require('body-parser');
var {mongoose} = require('./db/db');
var {User} = require('./model/UserSchema');
var {Todo} = require('./model/TodoSchema');

var app = express();

app.use(bodyparser.json());

app.get('/',function(req, res){
    res.send("Hello World");
});

app.post('/createUser', function(req, res){
    var userCreate = new User(req.body);
    userCreate.save(userCreate).then((doc)=>{
        console.log("The document was saved");
        res.status(201).send(doc);
    }).catch(e=>{
        res.status(400).send(e);

    })

});

app.post('/CreateTodo',(req, res)=>{
    var TodoCreate = new Todo(req.body);
    TodoCreate.save().then((todo)=>{
        console.log("Todo was added to the list");
        res.status(201).send(todo);
    }).catch((e)=>{
        console.log(e);
        res.status(400).send(e);
        //console.log("There was an error while adding a todo task");
    })
});

app.listen(3000,() => console.log('Example app listening on port 3000!'));

module.exports={
    app
}