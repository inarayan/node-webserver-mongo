var ObjectID = require('mongodb');
var express = require('express');
var bodyparser = require('body-parser');
var {mongoose} = require('./db/db');
var {User} = require('./model/UserSchema');
var {Todo} = require('./model/TodoSchema');

var app = express();

//Create a port variable for heroku
const port = process.env.PORT || 3000;


app.use(bodyparser.json());

app.get('/',function(req, res){
    res.send("Hello World");
});

app.post('/createUser', function(req, res){
    var userCreate = new User(req.body);
    userCreate.save(userCreate).then((doc)=>{
        console.log("The document was saved to date");
        res.status(201).send(doc);
    }).catch(e=>{
        res.status(400).send(e);

    })

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
    Todo.find({}).then((docs)=>{
        res.send({docs});
    }).catch((e)=>{
        res.status(404).send(e);
    })
});

//Search a todo by Id
app.get('/todos/:id', (req, res) => {
    var searchid = req.params.id;

    Todo.findById(searchid).then((todo) => {
        if(todo){
           res.send({todo});

       }else{
            res.status(404).send("Todo not found!!");
       }

    }).catch((e) => {
        res.status(400).send(e);
    })

})

app.listen(port,() => console.log('Example app listening on port'+`${port}`));

module.exports={
    app
}